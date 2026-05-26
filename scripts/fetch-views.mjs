import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

const OUTPUT = resolve('src/lib/data/views.json');
const token = process.env.CLOUDFLARE_API_TOKEN;
const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;

function writeEmpty() {
	mkdirSync(dirname(OUTPUT), { recursive: true });
	writeFileSync(OUTPUT, JSON.stringify({}, null, 2));
}

if (!token || !accountId) {
	console.warn('[fetch-views] 環境変数が未設定のためスキップします');
	writeEmpty();
	process.exit(0);
}

const since = new Date(Date.now() - 30 * 86_400_000).toISOString().split('T')[0];

// siteTag フィルタを使わずアカウント全体を取得して /posts/* だけ合算する。
// ビーコントークン（JS スニペットの値）と Analytics 内部の siteTag が一致せず、
// 単一の siteTag で絞り込むとヒット 0 件になるため。
const query = `
  query TopPages($accountTag: String!, $since: Date!) {
    viewer {
      accounts(filter: { accountTag: $accountTag }) {
        rumPageloadEventsAdaptiveGroups(
          filter: { date_geq: $since }
          limit: 200
          orderBy: [count_DESC]
        ) {
          count
          dimensions { requestPath }
        }
      }
    }
  }
`;

let res;
try {
	res = await fetch('https://api.cloudflare.com/client/v4/graphql', {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${token}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ query, variables: { accountTag: accountId, since } })
	});
} catch (e) {
	console.warn('[fetch-views] fetch 失敗:', e.message);
	writeEmpty();
	process.exit(0);
}

if (!res.ok) {
	console.warn('[fetch-views] API エラー:', res.status, await res.text());
	writeEmpty();
	process.exit(0);
}

const json = await res.json();

if (json.errors) {
	console.warn('[fetch-views] GraphQL エラー:', JSON.stringify(json.errors));
	writeEmpty();
	process.exit(0);
}

const accounts = json?.data?.viewer?.accounts ?? [];
const groups = accounts[0]?.rumPageloadEventsAdaptiveGroups ?? [];

const counts = {};
for (const g of groups) {
	const path = g.dimensions.requestPath;
	const m = path.match(/^\/posts\/([^/]+)\/?$/);
	if (!m) continue;
	const slug = m[1];
	counts[slug] = (counts[slug] ?? 0) + g.count;
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, JSON.stringify(counts, null, 2));
console.log(`[fetch-views] ${Object.keys(counts).length} 件の閲覧数を書き出しました`);
