# -*- coding: utf-8 -*-
import sys

def patch():
    filepath = r'd:\developer\OnriviMarkDown\frontend\src\app\page.tsx'
    with open(filepath, 'rb') as f:
        content = f.read().decode('utf-8')

    orig_lf = content.replace('\r\n', '\n')
    patched_lf = orig_lf

    # SYNC-02: 태그 주입 즉시 구문 토큰 리프레시 및 중복 MODAL_COMMANDS 선언 제거
    target_sync_02_bad = """    // [WBS SYNC-02] 본문 조작 명령이 완료된 직후 에디터 전체 토큰의 구문 강조 강제 리프레시 트리거
    try {
      if (model) {
        const totalLines = model.getLineCount();
        for (let i = 1; i <= totalLines; i++) {
          model.forceTokenization(i);
        }
      }
    } catch (_) {}

    const MODAL_COMMANDS: EditorCommandType[] = ['IMAGE', 'VIDEO', 'YOUTUBE', 'MAP', 'TABLE', 'LATEX', 'MATH', 'LINK'];
    if (!MODAL_COMMANDS.includes(type)) {
      editor.focus();
    }
  }, [handlers]);"""

    repl_sync_02_fixed = """    // [WBS SYNC-02] 본문 조작 명령이 완료된 직후 에디터 전체 토큰의 구문 강조 강제 리프레시 트리거
    try {
      if (model) {
        const totalLines = model.getLineCount();
        for (let i = 1; i <= totalLines; i++) {
          model.forceTokenization(i);
        }
      }
    } catch (_) {}
  }, [handlers]);"""

    if target_sync_02_bad.replace('\r\n', '\n') in patched_lf:
        patched_lf = patched_lf.replace(target_sync_02_bad.replace('\r\n', '\n'), repl_sync_02_fixed.replace('\r\n', '\n'))
        print("SYNC-02: Fixed redefined MODAL_COMMANDS successfully.")
    else:
        print("SYNC-02: Target NOT found!")

    if '\r\n' in content:
        final_content = patched_lf.replace('\n', '\r\n')
    else:
        final_content = patched_lf

    with open(filepath, 'wb') as f:
        f.write(final_content.encode('utf-8'))
    print("Done.")

if __name__ == '__main__':
    patch()
