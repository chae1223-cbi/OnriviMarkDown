# -*- coding: utf-8 -*-
import sys

def patch():
    filepath = r'd:\developer\OnriviMarkDown\frontend\src\components\FileTreeItem.tsx'
    with open(filepath, 'rb') as f:
        content = f.read().decode('utf-8')

    lf = content.replace('\r\n', '\n')

    # node.path undefined 타입 에러 수정
    target_bad = """            // 💡 [요구사항 1] 파일 혹은 폴더 이름 변경 시 현재 열려 있는 문서의 경로가 이 영향을 받으면 즉각 갱신
            if (currentFilePath) {
              const normCurrent = currentFilePath.replace(/\\\\/g, '/');
              const normOld = node.path.replace(/\\\\/g, '/');
              const normNew = newPath.replace(/\\\\/g, '/');
              if (normCurrent === normOld) {
                openFile({ name: finalName, kind: node.kind, path: newPath });
              } else if (normCurrent.startsWith(normOld + '/')) {
                const updatedPath = currentFilePath.substring(node.path.length);
                openFile({ name: currentFileName, kind: 'file', path: newPath + updatedPath });
              }
            } else if (currentFileName === node.name) {"""

    repl_fixed = """            // 💡 [요구사항 1] 파일 혹은 폴더 이름 변경 시 현재 열려 있는 문서의 경로가 이 영향을 받으면 즉각 갱신
            if (node.path && currentFilePath) {
              const normCurrent = currentFilePath.replace(/\\\\/g, '/');
              const normOld = node.path.replace(/\\\\/g, '/');
              const normNew = newPath.replace(/\\\\/g, '/');
              if (normCurrent === normOld) {
                openFile({ name: finalName, kind: node.kind, path: newPath });
              } else if (normCurrent.startsWith(normOld + '/')) {
                const updatedPath = currentFilePath.substring(node.path.length);
                openFile({ name: currentFileName, kind: 'file', path: newPath + updatedPath });
              }
            } else if (currentFileName === node.name) {"""

    # else 분기(fetch fetch API로 이름 변경 시)의 target_bad2도 수정
    target_bad2 = """              if (currentFilePath) {
                const normCurrent = currentFilePath.replace(/\\\\/g, '/');
                const normOld = node.path.replace(/\\\\/g, '/');
                const normNew = newPath.replace(/\\\\/g, '/');
                if (normCurrent === normOld) {
                  openFile({ name: finalName, kind: node.kind, path: newPath });
                } else if (normCurrent.startsWith(normOld + '/')) {
                  const updatedPath = currentFilePath.substring(node.path.length);
                  openFile({ name: currentFileName, kind: 'file', path: newPath + updatedPath });
                }
              } else if (currentFileName === node.name) {"""

    repl_fixed2 = """              if (node.path && currentFilePath) {
                const normCurrent = currentFilePath.replace(/\\\\/g, '/');
                const normOld = node.path.replace(/\\\\/g, '/');
                const normNew = newPath.replace(/\\\\/g, '/');
                if (normCurrent === normOld) {
                  openFile({ name: finalName, kind: node.kind, path: newPath });
                } else if (normCurrent.startsWith(normOld + '/')) {
                  const updatedPath = currentFilePath.substring(node.path.length);
                  openFile({ name: currentFileName, kind: 'file', path: newPath + updatedPath });
                }
              } else if (currentFileName === node.name) {"""

    if target_bad.replace('\r\n', '\n') in lf:
        lf = lf.replace(target_bad.replace('\r\n', '\n'), repl_fixed.replace('\r\n', '\n'))
        print("First block fixed.")
    else:
        print("First block target NOT found!")

    if target_bad2.replace('\r\n', '\n') in lf:
        lf = lf.replace(target_bad2.replace('\r\n', '\n'), repl_fixed2.replace('\r\n', '\n'))
        print("Second block fixed.")
    else:
        print("Second block target NOT found!")

    if '\r\n' in content:
        final_content = lf.replace('\n', '\r\n')
    else:
        final_content = lf

    with open(filepath, 'wb') as f:
        f.write(final_content.encode('utf-8'))
    print("Done.")

if __name__ == '__main__':
    patch()
