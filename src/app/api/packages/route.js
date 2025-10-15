import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma.js';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Introspect columns to tolerate different naming (snake_case, camelCase, lowercase)
async function getColumnsMap(table = 'ProjectPackage') {
  const rows = await prisma.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`,
    table
  );
  const list = Array.isArray(rows) ? rows.map(r => String(r.column_name || r.COLUMN_NAME || '')) : [];
  const lower = new Map(list.map(n => [n.toLowerCase(), n]));
  return { list, lower };
}

function pickCol(lowerMap, candidates) {
  for (const c of candidates) {
    const found = lowerMap.get(c.toLowerCase());
    if (found) return found;
  }
  return null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const projectId = Number(searchParams.get('projectId'));
    if (!Number.isFinite(projectId)) return NextResponse.json([]);

    const table = 'ProjectPackage';
    const { lower } = await getColumnsMap(table);

    const idCol = pickCol(lower, ['id']) || 'id';
    const nameCol = pickCol(lower, ['name']);
    const pkgNumCol = pickCol(lower, ['packagenumber', 'package_number', 'packageNumber']);
    const tentativeCol = pickCol(lower, ['tentativedate', 'tentative_date', 'tentativeDate']);
    const issueCol = pickCol(lower, ['issuedate', 'issue_date', 'issueDate']);
    const statusCol = pickCol(lower, ['status']);
    const projectCol = pickCol(lower, ['projectid', 'project_id', 'projectId']) || 'projectid';
    const createdCol = pickCol(lower, ['createdat', 'created_at', 'createdAt']) || idCol;

    // Build SELECT list with aliases, falling back to NULL when a column is missing
    const sel = [
      `"${idCol}" AS id`,
      nameCol ? `"${nameCol}" AS name` : `NULL AS name`,
      pkgNumCol ? `"${pkgNumCol}" AS packagenumber` : `NULL AS packagenumber`,
      tentativeCol ? `"${tentativeCol}" AS tentativedate` : `NULL AS tentativedate`,
      issueCol ? `"${issueCol}" AS issuedate` : `NULL AS issuedate`,
      statusCol ? `"${statusCol}" AS status` : `NULL AS status`,
    ].join(', ');

    const sql = `
      SELECT ${sel}
      FROM "public"."${table}"
      WHERE "${projectCol}" = $1
      ORDER BY "${createdCol}" DESC
    `;
    const rows = await prisma.$queryRawUnsafe(sql, projectId);

    const data = (rows || []).map(r => ({
      id: Number(r.id),
      name: r.name || r.packagenumber || (r.id != null ? `Package-${r.id}` : 'Package'),
      packageNumber: r.packagenumber || null,
      tentativeDate: r.tentativedate || null,
      issueDate: r.issuedate || null,
      status: r.status || null,
    }));

    return NextResponse.json(data);
  } catch (e) {
    console.error('GET /api/packages error:', e?.message || e);
    return NextResponse.json({ error: 'Failed to load packages' }, { status: 500 });
  }
}
