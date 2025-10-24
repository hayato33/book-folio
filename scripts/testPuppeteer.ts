/**
 * Puppeteer動作検証用の一時的なテストファイル
 *
 * 目的: PuppeteerがAmazon.co.jpから書籍の表紙画像URLを取得できるかの検証
 * 注意: このファイルは検証用の一時的なものです。本番実装では削除予定。
 *
 * 実行方法: pnpm test:puppeteer
 */

import puppeteer, { LaunchOptions } from 'puppeteer';

async function main() {
  console.log('🚀 Puppeteerの動作検証を開始します...');

  // Puppeteerの起動設定
  const launchOptions: LaunchOptions = {
    headless: true,
  };

  // Chrome実行パスを環境変数から設定（存在する場合のみ）
  if (process.env.CHROME_PATH) {
    launchOptions.executablePath = process.env.CHROME_PATH;
  }

  // テスト環境でのみサンドボックス無効化フラグを追加
  const args: string[] = [];
  if (process.env.NODE_ENV === 'test' || process.env.DISABLE_SANDBOX === 'true') {
    args.push('--no-sandbox', '--disable-setuid-sandbox');
  }

  if (args.length > 0) {
    launchOptions.args = args;
  }

  const browser = await puppeteer.launch(launchOptions);

  console.log('✅ ブラウザを起動しました');
  const page = await browser.newPage();

  const title = 'リーダブルコード';
  const query = encodeURIComponent(title);
  const url = `https://www.amazon.co.jp/s?k=${query}`;

  console.log(`🔍 Amazon検索中: ${title}`);
  console.log(`📍 アクセス先: ${url}`);

  await page.goto(url, {
    waitUntil: 'networkidle0',
  });

  console.log('📄 ページ読み込み完了');

  // 最初の書籍の表紙URLを取得
  const coverUrl = await page.$eval('img.s-image', (img: HTMLImageElement) => img.src).catch(() => null);

  if (coverUrl) {
    console.log('✅ 書籍の表紙URLを取得しました:');
    console.log(`🖼️  ${coverUrl}`);
  } else {
    console.log('❌ 書籍の表紙URLが見つかりませんでした');
  }

  await browser.close();
  console.log('🏁 処理完了');
}

main().catch((error) => {
  console.error('❌ エラーが発生しました:', error);
  process.exit(1);
});
