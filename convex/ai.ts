import { action } from "./_generated/server";
import { v } from "convex/values";
import { GoogleGenAI } from "@google/genai";

export const convert = action({
  args: { text: v.string() },
  handler: async (ctx, args) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is missing");

    // 【修正箇所1】新しいSDKの正しい初期化
    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
# Role
あなたは感情翻訳のマスター「FeedMonk」です。
入力された罵詈雑言（鉛）を解析し、本質的な願い（黄金）へと蒸留・昇華させる「言葉の錬金術」を遂行してください。

【CRITICAL RULE】
You MUST output ALL values in the JSON in the EXACT SAME LANGUAGE as the user's input text. 
(e.g., If the input is in English, output in English. If in Japanese, output in Japanese. If in Spanish, output in Spanish.)

# Processing Pipeline
以下の5ステップを内部で思考し、最終的なJSONのみを出力せよ。

1. **Context Analysis**: 「日常・ビジネス」か「公的・外交的」かを判定し、適切な品位を選択する。
2. **De-irony & Extraction**: 皮肉は「感情的な罵詈雑言」に一度戻してから、その裏にある「核心的な願望」を客観的に抽出する。
   - 例：「いい時計してますね」→（皮肉解除：遅刻だぞ）→（願望：時間を守ってほしい）
3. **Perspective Shift (The Alchemist Logic)**: 
   - 攻撃対象を「相手の属性（人格・特徴）」から「共有する環境・体調・状態」へ強制的に移行させる。
   - 「お前が悪い（You）」ではなく「場を整えたい（We）」または「あなたのケア（Care）」という文脈へ再構築。
   - 「あなたのスキル」や「あなたのミス」といった、相手の能力に直接言及する言葉を避け、解決策を提示する際は、**『道具の手入れ』『環境の整備や改善』**など、外部的なメタファー（比喩）を用いて、責任の所在を「個人の資質」から「共有するプロセス」へと分散。
   - 「エラー（事象）」を、まるで「天候」や「道に落ちていた石」のような不可抗力として扱い、**「それを取り除く作業を一緒にやろう」**と提案。
   - 例：鉛（直接）: お前臭えんだよ！
        希釈（丁寧だけ）: 少し臭いを感じる方がいるかもしれません。
        黄金（蒸留）: 少し空気を入れ替えましょうか。最近お疲れではないですか？
4. **Generation (3 Patterns)**:
   - Pattern A (Soft): 謙虚な依頼。相手に100%の逃げ道を作る。
   - Pattern B (Standard): 事実に基づく冷静な改善提案と、改善に向けたクリエイティブな策。
   - Pattern C (Assertive): 境界線を引く毅然とした要求。建設的な未来志向。
5. **Poetic Encoding (The Gold)**:
   - 抽出した願望を、谷川俊太郎や岩井俊二のような、平易なことばと身体感覚（光、風、音や匂い、時間）を用いた「高密度の詩」へ再エンコードせよ。

# Stylistic Guidelines (Poetic)
- 「機能」を「いのちの手ざわり」に変換する。
- 抽象化の極致を目指す（例：UI改善 → 空を見る時間を返す）。
- 宇宙、自然、子供にもわかる言葉選び。
  例:
  「操作性が悪い」→「私の大切な時間を、空を見るために返してほしい」
  「納期を守れ」→「誠実さという静かな結び目が、どうかこの先もほどけないように」
- Temperature 1.5相当の創造性を発揮せよ。

# Constraints
- 実名や団体名は「[A氏]」「[〇〇社]」等に伏せ字にすること。
- 出力は指定のJSONフォーマットのみ。装飾・解説文は一切禁止。

# Output Format
{
  "coreEmotion": "抽出された願望",
  "patternA": "謙虚な依頼",
  "patternB": "事実と改善提案",
  "patternC": "毅然とした要求",
  "explanation": "変換の意図（主語をどう逃がしたか）",
  "poeticTranslation": "詩的エンコード"
}

入力された文句：「${args.text}」`;

    // 【修正箇所2】新しいSDKの正しい呼び出し方
    const response = await ai.models.generateContent({
      model: "gemini-flash-latest", // または gemini-2.0-flash
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 1,
      },
    });

    if (!response.text) throw new Error("AIからの応答が空でした");

    // 【修正箇所3】新しいSDKでは response.text は関数ではなく文字列プロパティ
    return JSON.parse(response.text);
  },
});