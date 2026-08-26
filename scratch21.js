const fs = require("fs");
let content = fs.readFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", "utf8");

content = content.replace(`                            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                            scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);
                          }
                            }
                      }
                    });
                  });`, `                            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                            scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);
                          }
                      }
                    });
                  });`);

fs.writeFileSync("frontend/src/hooks/editor/useMonacoSetup.ts", content, "utf8");
