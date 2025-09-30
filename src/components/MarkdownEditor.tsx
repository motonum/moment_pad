import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, keymap } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { syntaxHighlighting } from "@codemirror/language";
import { oneDarkHighlightStyle } from "@codemirror/theme-one-dark";

// 背景を透明にし、基本的なスタイルを設定するカスタムベーステーマ
const transparentTheme = EditorView.theme({
  "&": {
    backgroundColor: "transparent",
    color: "inherit",
    height: "100%",
  },
  ".cm-scroller": {
    overflow: "auto",
  },
  ".cm-gutters": {
    backgroundColor: "transparent",
    border: "none",
  },
  "&.cm-editor": {
    // エディタがダークモードであることをブラウザに伝える
    colorScheme: "dark",
  },
  "&.cm-editor.cm-focused": {
    outline: "none",
  },
  ".cm-content": {
    caretColor: "white",
  },
});

interface Props {
  value: string;
  onChange: (value: string) => void;
}

const MarkdownEditor = ({ value, onChange }: Props) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: 再レンダリング時にエディタを再初期化しないようにする
  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: value,
      extensions: [
        keymap.of([...defaultKeymap, indentWithTab]),
        markdown({
          base: markdownLanguage,
          codeLanguages: languages,
        }),
        syntaxHighlighting(oneDarkHighlightStyle),
        transparentTheme,
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            const newText = update.state.doc.toString();
            onChangeRef.current(newText);
          }
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    view.focus();

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (view && value !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    }
  }, [value]);

  return <div ref={editorRef} className="memo-pad" />;
};

export default MarkdownEditor;
