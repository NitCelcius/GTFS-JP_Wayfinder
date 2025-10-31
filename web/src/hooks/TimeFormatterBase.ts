/**
 * 時刻フォーマッタの抽象基底クラス（更新間隔計算機能付き）
 */
export abstract class TimeFormatterBase {
  /**
   * 時間差を表示文字列にフォーマットする
   * @param secondsUntilTarget - 現在時刻から目標時刻までの秒数
   *                             - 正の値 = 未来（300 = "5分後"）
   *                             - 負の値 = 過去（-300 = "5分前"）
   *                             - ゼロ = 現在
   * @returns フォーマットした表示文字列
   */
  abstract format(secondsUntilTarget: number): string;

  /**
   * 次回表示を更新すべきミリ秒数を計算する
   * デフォルトでは毎秒更新とする
   * @param secondsUntilTarget - 目標時刻までの秒数（正=未来、負=過去）
   * @returns 次回更新までのミリ秒数
   */
  getNextUpdateMs(secondsUntilTarget: number): number {
    return secondsUntilTarget;
  }
}

/**
 * デフォルトの相対時刻フォーマッタ
 * - 1分未満: "まもなく"/"now"/(秒数) (ユーザーのロケールに応じる)
 * - 1〜59分: ユーザーのロケールに応じた形式（例: "N分後", "in N minutes"）
 * - 60分以上: ユーザーのロケールに応じた形式（例: "N時間後", "in N hours"）
 *
 * @param locale - ロケール文字列（指定しない場合、ブラウザのロケール）
 */
export class DefaultTimeFormatter extends TimeFormatterBase {
  private rtf: Intl.RelativeTimeFormat;
  private locale: string;

  constructor(locale?: string) {
    super();
    // 指定されたロケールがなければブラウザのロケールを使うか、"ja" にする
    this.locale =
      locale ?? (typeof navigator !== "undefined" ? navigator.language : "ja");
    this.rtf = new Intl.RelativeTimeFormat(this.locale, { numeric: "always" });
  }

  format(secondsUntilTarget: number): string {
    const absDiff = Math.abs(secondsUntilTarget);
    const languagePrefix = this.locale.split("-")[0];
    const isJapanese = languagePrefix === "ja";

    // 1分未満 - 日本語と英語のみカスタムテキスト、それ以外はrtfに任せる
    if (absDiff < 60) {
      // 日本語の場合は「まもなく」
      if (isJapanese) {
        return "まもなく";
      }

      // 英語の場合は「now」
      if (languagePrefix === "en") {
        return "now";
      }

      // その他の言語はrtfに任せる
      const seconds = Math.floor(secondsUntilTarget);
      return this.rtf.format(seconds, "second");
    }

    // 1〜59分
    if (absDiff < 3600) {
      const minutes = Math.floor(secondsUntilTarget / 60);
      const formatted = this.rtf.format(minutes, "minute");
      // 日本語のみスペースを削除
      return isJapanese ? formatted.replace(/\s+/g, "") : formatted;
    }

    // 60分以上
    const hours = Math.floor(secondsUntilTarget / 3600);
    const formatted = this.rtf.format(hours, "hour");
    // 日本語のみスペースを削除
    return isJapanese ? formatted.replace(/\s+/g, "") : formatted;
  }

  getNextUpdateMs(secondsUntilTarget: number): number {
    const absDiff = Math.abs(secondsUntilTarget);

    // 1分未満になるタイミング
    if (absDiff < 60) {
      const secondsUntilChange = 60 - absDiff;
      return secondsUntilChange * 1000;
    }

    // 1〜59分: 次の分の境界で更新
    if (absDiff < 3600) {
      const secondsIntoCurrentMinute = absDiff % 60;
      const secondsToNextMinute =
        secondsIntoCurrentMinute === 0 ? 60 : 60 - secondsIntoCurrentMinute;
      return secondsToNextMinute * 1000;
    }

    // 60分以上: 表示形式が変わる時に更新（時間→分 または 2時間→1時間など）
    // 3600秒ごとに更新するので、このあまりぶんを間隔とする
    const secondsToNextHour = absDiff % 3600 === 0 ? 3600 : absDiff % 3600;
    return secondsToNextHour * 1000;
  }
}

/**
 * MM:SSカウントダウン形式
 * 例:"05:30"（残り5分30秒）
 */
export class MMSSFormatter extends TimeFormatterBase {
  format(secondsUntilTarget: number): string {
    const absDiff = Math.abs(secondsUntilTarget);

    if (absDiff >= 3600) {
      // 1時間以上の場合は時間表示にフォールバック
      const hours = Math.floor(absDiff / 3600);
      return `${hours}時間`;
    }

    const minutes = Math.floor(absDiff / 60);
    const seconds = absDiff % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  getNextUpdateMs(): number {
    // 正確なカウントダウンのため毎秒更新
    return 1000;
  }
}

/**
 * 短め:"5分" または "2時間"（後/前の接尾辞なし）
 */
export class CompactFormatter extends TimeFormatterBase {
  format(secondsUntilTarget: number): string {
    const absDiff = Math.abs(secondsUntilTarget);

    if (absDiff < 60) {
      return "まもなく";
    }

    if (absDiff < 3600) {
      const minutes = Math.floor(absDiff / 60);
      return `${minutes}分`;
    }

    const hours = Math.floor(absDiff / 3600);
    return `${hours}時間`;
  }

  getNextUpdateMs(secondsUntilTarget: number): number {
    const absDiff = Math.abs(secondsUntilTarget);

    // 1分未満:閾値を超える時に更新
    if (absDiff < 60) {
      return (60 - absDiff) * 1000;
    }

    // 1〜59分:分の境界で更新
    if (absDiff < 3600) {
      const secondsIntoCurrentMinute = absDiff % 60;
      return (60 - secondsIntoCurrentMinute) * 1000;
    }

    // 60分以上:時間の境界で更新
    const secondsIntoCurrentHour = absDiff % 3600;
    return (3600 - secondsIntoCurrentHour) * 1000;
  }
}
