import styles from "./NoRoutesState.module.css";

interface NoRoutesFoundStateProps {
  onBack: () => void;
}

export function NoRoutesFoundState({ onBack }: NoRoutesFoundStateProps) {
  return (
    <div>
      <div className={styles.noRoutesAlert}>
        <p className={styles.noRoutesTitle}>❌ 経路が見つかりません</p>
        <p>選択したバス停間で指定時間に運行する経路が見つかりませんでした。</p>
        <p className="mt-2">以下の原因が考えられます：</p>
        <ul className={styles.bulletList}>
          <li>バス停IDがGTFSデータに存在しない</li>
          <li>これらのバス停間に運行経路がない</li>
          <li>指定時間に運行サービスがない</li>
        </ul>
      </div>
      <div className={styles.halfScreenCenter}>
        <div className={styles.searchPanel}>
          <div className={styles.searchIcon}>🔍</div>
          <h2 className={styles.searchTitle}>検索準備完了</h2>
          <p className={styles.searchDesc}>
            経路検索を実行してリアルタイムのバス経路を確認しましょう
          </p>
          <button onClick={onBack} className={styles.searchStartBtn}>
            🚌 経路検索を開始
          </button>
        </div>
      </div>
    </div>
  );
}
