/**
 * ?꾨줈洹몃옩紐?: OnriviAuthor 
 * 踰꾩쟾 ?뺣낫 : 1.0.1
 * ?꾨줈洹몃옩 ID : oaar-001
 * -----------------------------------------------------------------------
 * 蹂寃쎈궡?? * -----------------------------------------------------------------------
 * <2026.05.29> 理쒖큹?묒꽦
 * ?묒꽦??: 梨꾨퀝?? *   * ?슚 @PATCH : **2026-08-13** ???ㅽ겕濡??붾룞 諛??뺢? ?꾩긽??洹쇰낯???닿껐???꾪빐 MainEditorApp ?댁쓽 紐⑤뱺 ?댁쨷/以묐났 ?ㅽ겕濡?蹂댁젙 ??postContentScrollCorrection) 諛????곗튂 媛뺤젣 李⑤떒 ?낆쓣 ?꾩쟾????젣?섍퀬, Monaco Setup???⑥씪 ?ㅽ겕濡?由ъ뒪?덈줈 ?숆린??援ъ“瑜??꾨웾 ?닿? 諛??뺣? 媛꾩냼?뷀븿
 *   * ?슚 @PATCH : **2026-08-12** ???먮뵒?곕? ?닿굅????쓣 ?リ퀬 ?꾪솚?????쒗븳?ъ슜??留뚮즺, ?숈떆?묒냽 ?쒗븳, 誘몄씤利?????沅뚰븳 媛?쒓? ?꾨씫?섏뼱 ?몄쭛 媛?ν빐吏??踰꾧렇 ?닿껐???꾪빐 isRestrictedUser 寃???듯빀 ?곸슜 諛?Monaco readOnly/domReadOnly ?듭뀡 ?숆린??蹂댁셿; 理쒖큹 寃利????숈떆?묒냽 ?ㅽ뙣 ???댁쨷 寃利?蹂듦뎄 ?고쉶濡쒕? 李⑤떒?섍퀬 isRestricted ?꾨뱶瑜?濡쒖뺄 蹂댁븞 罹먯떆? setLicenseStatus??諛遊??곕룞?섏뿬 罹먯떆 ?ル┝ ?꾩긽 ?먯쿇 ?닿껐
 *   * ?슚 @PATCH : **2026-08-12** ???먮뵒??留덉?留?2以??대궡?먯꽌 ??댄븨 ??誘몃━蹂닿린 ?곸뿭???꾨줈 ??댁꽌 ?낅젰 ?댁슜??媛?ㅼ???踰꾧렇 ?닿껐???꾪빐 postContentScrollCorrection ?낆뿉 setTimeout(50ms) 湲곕컲 吏??理쒗븯??諛李??ㅽ겕濡?蹂닿컯 ?곸슜
 *   * ?슚 @PATCH : **2026-07-22** ???대씪?댁뼵??吏곸젒 supabase.rpc() ?몄텧 ?꾨웾 ?쒕쾭??API Route fetch()濡??댁쟾: insert_license_activation??api/rpc/license/insert, check_license_session(횞2)??api/license/check-session, verify_desktop_license??api/license/verify-desktop; Realtime 援щ룆 ?뚯씠釉붾챸 license_activations?뭠icense_activations ?꾪솚
 *   * ?슚 @PATCH : **2026-07-22** ??subscriptions ?⑥씪 ?듯빀 ?뚯씠釉?媛쒗렪??留욎떠 software_licenses 諛?users ?덇굅??荑쇰━ 李몄“瑜?subscriptions ?⑥씪 荑쇰━濡??쇨큵 留덉씠洹몃젅?댁뀡 ?곸슜
 *   * ?슚 @PATCH : **2026-07-20** ???뚮줈???대컮???⑤룆 AI Sparkles(?? ?꾩씠肄??대┃ ??湲곗〈??誘몄옉?숉븯???몃씪??誘몃━蹂닿린(setAiPreviewState)瑜??쒓굅?섍퀬, ?뺤긽?곸씤 AI ?먮뵒?좊━???댁떆?ㅽ꽩??紐⑤떖(AiDraftModal)???대━?꾨줉 OPEN_AI_WRITER 而ㅻ㎤???붿뒪?⑥튂濡??섏젙. ?먰븳 ?띿뒪??留덊겕?ㅼ슫 議곗옉 洹몃９??以묐났?쇰줈 議댁옱?섎뜕 ?띿뒪???대え吏(?? 踰꾪듉???쒓굅?섏뿬 ?대컮 ?ν솴??媛쒖꽑 諛?湲곕뒫 ?⑥씪???⑥튂 ?곸슜 | **2026-07-18** ???쇱씠?좎뒪 留뚮즺 諛?誘몄듅???곹깭(isExpired)????Monaco ?먮뵒?곌? ?몄쭛 遺덇?(readOnly, domReadOnly) ?곹깭濡??꾪솚?섎룄濡?媛뺤젣??蹂닿컯, ?곗뺨?섏씠吏 ?좎삁 ?쒓컙 鍮④컙??寃쎄퀬 硫붿떆吏 諛곕꼫 UI ?쒓굅
   *             **2026-07-15** ??ModalManager deps 媛앹껜?먯꽌 window.SYSTEM_PROFILES/DEFAULT_PROFILE/isSystemProfileId瑜?window ?꾩뿭?먯꽌 ?쎈뜕 ?섎せ??肄붾뱶瑜?紐⑤뱢 import ?곸닔 吏곸젒 李몄“濡??섏젙 (window??二쇱엯?섏? ?딆븘 ??긽 鍮?諛곗뿴/媛앹껜濡??대갚 ???쒖떇 ??젣 ??SYSTEM_PROFILES[0] undefined TypeError 踰꾧렇 ?섏젙) | AI ?ъ깮??諛?紐⑤떖 ?リ린/痍⑥냼 ??諛깃렇?쇱슫???ㅽ듃由щ컢??臾댄슚?뷀븯??generationIdRef 媛??異붽?(?숈씪 紐⑤떖 ?ъ쭊???먮뒗 ?ъ깮?????댁쟾 踰꾪띁媛 ?ㅻ쾭?⑸릺???꾩긽 ?꾨꼍 議곗튂), ?먮뵒??留덉?留?????댄븨 ???붾㈃???꾩븘?섎줈 ?붾뱾由щ뒗(jitter) ?꾩긽 ?닿껐???꾪빐 scrollBeyondLastLine: false? 異⑸룎?섎뒗 bottom ?⑤뵫??0?쇰줈 議곗젙, AI 寃곌낵 諛섏쁺 ??蹂몃Ц ?泥??쎌엯 諛??섎떒 異붽?) ?먮뵒???ъ빱?ㅻ? ?띾뱷?섍퀬 而ㅼ꽌???꾩튂瑜?諛섏쁺???띿뒪??釉붾줉??泥섏쓬 ?쒖옉 吏?먯쑝濡??먮룞 ?ㅼ쐞移?setPosition/revealPositionInCenter)?섎룄濡?媛쒖꽑, AI ?먮뵒?좊━???댁떆?ㅽ꽩?몄뿉 而⑦뀓?ㅽ듃 ?놁쓬(?쇰컲 吏덈Ц) ?좏깮 ?듭뀡(targetScope: none)??湲곕낯媛믪쑝濡?異붽? ?쒓났?섏뿬 遺덊븘?뷀븳 蹂몃Ц 李몄“ ?꾩긽 ?닿껐 諛?蹂몃Ц ?쎌엯/異붽? 濡쒖쭅 而ㅼ꽌 ?꾩튂 ?곕룞 蹂닿컯, AI ?먮뵒?좊━???댁떆?ㅽ꽩??紐⑤떖 ?ㅽ뵂 ??紐낅졊 ?낅젰李?textarea)???먮룞?쇰줈 ?ъ빱??autoFocus)媛 媛?꾨줉 湲곕뒫 蹂댁셿, 臾몄꽌 ?곌껐(臾몄꽌留곹겕) ?쎌빱 紐⑤떖???몄텧 ?꾩튂瑜?湲곗〈 floatingToolbar 湲곗??먯꽌 ?꾩옱 Monaco ?먮뵒?곗쓽 而ㅼ꽌(Cursor) 醫뚰몴 ?꾩튂濡??ㅼ떆媛?怨꾩궛?섏뿬 異쒕젰?섎룄濡??ㅽ럹?댁뒪 蹂댁젙 諛??붾㈃ ?댄깉 諛⑹? 媛??異붽? | **2026-07-14** ??AI 湲?곌린 ?댁떆?ㅽ꽩???곸슜 踰붿쐞(?좏깮 ?곸뿭 vs ?꾩껜 臾몄꽌) ?ㅼ쐞移??좉? ?듭뀡 諛?吏?ν삎 臾몃㎘ ?먮룞 寃고빀 ?듭뀡 ?묒옱, ?대컮 ?ν솴??洹밸났???꾪븳 ?곷떒 諛??뚮줈???대컮 ?⑤룆 AI Sparkles(?? ?꾩씠肄?二쇱엯, 留욎땄踰??ㅽ깉?????쇰컲 吏???ы빆??諛섏쓳?섎룄濡?action ?섎뱶肄붾뵫 援먯젙 諛?[異쒕젰寃곌낵] 媛쒗뻾 ?듭빱 ?뺢퇋???꾪꽣 蹂댁젙 | **2026-07-04** ???쒖떇?ㅼ젙(CSS ?꾨줈?? 吏꾩엯 諛⑹떇??湲곗〈 媛????컮 湲곕컲 ?듯빀 媛쒗렪?먯꽌 **?꾩껜?붾㈃ 紐⑤떖 ?앹뾽 媛ㅻ윭由?CssStyleModal)** 諛⑹떇?쇰줈 ?ъ감 ?꾨㈃ 媛쒗렪. ??異⑸룎 踰꾧렇 諛??곗뒪?ы깙 ?뚮뜑留??먮윭瑜??먯쿇 李⑤떒?섍퀬 吏곴??곸씤 ?섑뵆 臾몄꽌 湲곕컲 ?꾨━酉??섍꼍 ?쒓났 | **2026-07-04** ????쓣 紐⑤몢 ?リ굅???뚯씪 ?꾪솚 ???쒗븳(留뚮즺) ?ъ슜?먮뒗 ??긽 誘몃━蹂닿린 ?꾩슜('preview') 紐⑤뱶濡?媛뺤젣 怨좎젙?섍퀬, ?꾩껜(?쇰컲) ?ъ슜?먮뒗 ?섎떒 ?곹깭諛??깆뿉???쒖꽦?붾맂 吏곸쟾???먮뵒??酉곗엵 紐⑤뱶瑜?洹몃?濡??곸냽 諛??좎??섏뿬 ??낵 ?좉린?곸쑝濡??숆린?뷀븯??UI 蹂댁젙 ?⑥튂
   *             **2026-06-23** ???숈떆?묒냽 ?쒗븳 珥덇낵 ?щ?瑜??ㅼ떆媛?珥??몄뀡 ?섎줈 ?먮퀎?섎룄濡?`fiveMinAgo` ?꾪꽣 ?쒓굅 / ?숈떆?묒냽???붽툑???쒕룄 珥덇낵 ??媛뺤젣 濡쒓렇?꾩썐/濡쒓렇???뺢? ????먮뵒?곌? ?몄쭛 遺덇? 諛?誘몃━蹂닿린 ?꾩슜 紐⑤뱶濡??쒗븳?섎룄濡?媛쒖꽑 / isExpired ?곹깭 蹂????Monaco Editor??readOnly/domReadOnly ?듭뀡???ㅼ떆媛?媛뺤젣 ?숆린?뷀븯?꾨줉 蹂댁셿 / ??異붽?(+) 踰꾪듉 湲곕뒫 ?쒓굅移섎줈 ?ㅼ떆媛?怨꾩궛?섏뿬 異쒕젰?섎룄濡??ㅽ럹?댁뒪 蹂댁젙 諛??붾㈃ ?댄깉 諛⑹? 媛??異붽? | **2026-07-14** ??AI 湲?곌린 ?댁떆?ㅽ꽩???곸슜 踰붿쐞(?좏깮 ?곸뿭 vs ?꾩껜 臾몄꽌) ?ㅼ쐞移??좉? ?듭뀡 諛?吏?ν삎 臾몃㎘ ?먮룞 寃고빀 ?듭뀡 ?묒옱, ?대컮 ?ν솴??洹밸났???꾪븳 ?곷떒 諛??뚮줈???대컮 ?⑤룆 AI Sparkles(?? ?꾩씠肄?二쇱엯, 留욎땄踰??ㅽ깉?????쇰컲 吏???ы빆??諛섏쓳?섎룄濡?action ?섎뱶肄붾뵫 援먯젙 諛?[異쒕젰寃곌낵] 媛쒗뻾 ?듭빱 ?뺢퇋???꾪꽣 蹂댁젙 | **2026-07-04** ???쒖떇?ㅼ젙(CSS ?꾨줈?? 吏꾩엯 諛⑹떇??湲곗〈 媛????컮 湲곕컲 ?듯빀 媛쒗렪?먯꽌 **?꾩껜?붾㈃ 紐⑤떖 ?앹뾽 媛ㅻ윭由?CssStyleModal)** 諛⑹떇?쇰줈 ?ъ감 ?꾨㈃ 媛쒗렪. ??異⑸룎 踰꾧렇 諛??곗뒪?ы깙 ?뚮뜑留??먮윭瑜??먯쿇 李⑤떒?섍퀬 吏곴??곸씤 ?섑뵆 臾몄꽌 湲곕컲 ?꾨━酉??섍꼍 ?쒓났 | **2026-07-04** ????쓣 紐⑤몢 ?リ굅???뚯씪 ?꾪솚 ???쒗븳(留뚮즺) ?ъ슜?먮뒗 ??긽 誘몃━蹂닿린 ?꾩슜('preview') 紐⑤뱶濡?媛뺤젣 怨좎젙?섍퀬, ?꾩껜(?쇰컲) ?ъ슜?먮뒗 ?섎떒 ?곹깭諛??깆뿉???쒖꽦?붾맂 吏곸쟾???먮뵒??酉곗엵 紐⑤뱶瑜?洹몃?濡??곸냽 諛??좎??섏뿬 ??낵 ?좉린?곸쑝濡??숆린?뷀븯??UI 蹂댁젙 ?⑥튂
 *             **2026-06-23** ???숈떆?묒냽 ?쒗븳 珥덇낵 ?щ?瑜??ㅼ떆媛?珥??몄뀡 ?섎줈 ?먮퀎?섎룄濡?`fiveMinAgo` ?꾪꽣 ?쒓굅 / ?숈떆?묒냽???붽툑???쒕룄 珥덇낵 ??媛뺤젣 濡쒓렇?꾩썐/濡쒓렇???뺢? ????먮뵒?곌? ?몄쭛 遺덇? 諛?誘몃━蹂닿린 ?꾩슜 紐⑤뱶濡??쒗븳?섎룄濡?媛쒖꽑 / isExpired ?곹깭 蹂????Monaco Editor??readOnly/domReadOnly ?듭뀡???ㅼ떆媛?媛뺤젣 ?숆린?뷀븯?꾨줉 蹂댁셿 / ??異붽?(+) 踰꾪듉 湲곕뒫 ?쒓굅
 *             **2026-06-22** ???먮뵒??吏꾩엯/?덈줈怨좎묠 ??license_activations ?뚯씠釉붿뿉 ?깅줉??湲곗〈 ?쒖꽦 ?몄뀡(existingAct)???좎떎?섏뿀?붾씪?? ?좏슚 ?붽툑??湲곌린 ?덉슜 ?쒕룄(max_devices) 誘몃쭔??寃쎌슦 ?먮룞?쇰줈 ?몄뀡 ?깅줉(Auto register)??蹂댁옣?섏뿬 媛뺤젣 濡쒓렇?꾩썐/濡쒓렇???뺢? ?꾩긽??洹쇰낯?곸쑝濡?李⑤떒?섎뒗 ?묒냽 ?몄뀡 ?먮룞 蹂듦뎄 蹂듭썝 媛???⑥튂
 *             **2026-06-19** ???먮뵒??誘몃━蹂닿린(諛섎컲 紐⑤뱶/誘몃━蹂닿린 ?꾩슜)???곹븯醫뚯슦 ?щ갚???쒖떇?ㅼ젙(CSS ?꾨줈?? ?섏튂 洹몃?濡??숆린?뷀븯?꾨줉 pageStyle 諛?遺紐?而⑦뀒?대꼫 ?⑤뵫 ?덉씠?꾩썐 媛쒖젙 | **2026-06-20** ???곗뒪?ы넲 ?쇱씠?좎뒪 ?먮룞 DB ?깅줉 諛?濡쒖뺄 諛쒓툒 濡쒖쭅 ?꾨㈃ 諛곗젣 (臾댁“嫄?誘몄씤利???誘몃━蹂닿린 ?꾩슜 ?좉툑), 濡쒖뺄 ?쒓컙 議곗옉 諛⑹뼱 媛??援ы쁽, 留뚮즺???먯젙 李⑤떒 諛깃렇?쇱슫???ㅼ?以꾨윭 諛?10遺??좎삁 移댁슫?몃떎????대㉧ ?곕룞, 留뚮즺 ??preview 紐⑤뱶 媛뺤젣 ?쒗븳 媛???곸슜
 * -----------------------------------------------------------------------
 */

// @ts-nocheck

"use client"; // next.js??洹쒖튃, ???섏씠吏??client side?먯꽌 ?뚮뜑留곷맖. 
//吏?쒖뼱 醫낅쪟?ㅽ뻾 諛??뚮뜑留??꾩튂?ㅻ챸 諛??꾪궎?띿쿂????븷"use client";
//理쒖쥌 ?좎?????釉뚮씪?곗??먮컮?ㅽ겕由쏀듃 Hooks(useState, useEffect)瑜??덉슜?섍퀬, 留덉슦???대┃쨌?ㅻ낫????댄븨 ???ㅼ떆媛?UI ?명꽣?숈뀡??泥섎━?????좎뼵?⑸땲??
//"use server";諛깆뿏??Node.js ?쒕쾭?꾨줎?몄뿏??釉뚮씪?곗?)?먯꽌 諛깆뿏???쒕쾭???⑥닔瑜?留덉튂 API ?몄텧?섎벏???ㅼ씠?됲듃濡??덉쟾?섍쾶 ?먭꺽 ?ㅽ뻾?????덇쾶 留뚮뱶???쒕쾭 
//?≪뀡(Server Actions) ?꾩슜 吏?쒖뼱?낅땲?? (蹂댁븞 ??寃利? DB 吏곸젒 CRUD ???ъ슜)

/** ======================================================================== 
 * 李멸퀬 
 *  src/lib/api.ts -> api ?쒕쾭 寃쎈줈
 * =========================================================================
*/

import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';   // 由ъ븸????- ?곹깭愿由? ?뚮뜑留??쒖뼱 ??import Editor, { loader } from '@monaco-editor/react'; // 紐⑤굹肄??먮뵒??- 肄붾뱶 ?몄쭛湲?const _monacoVsPath = typeof window !== 'undefined' && !!(window as any).electronAPI
  ? './monaco-editor/min/vs'
  : 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs';
loader.config({ paths: { vs: _monacoVsPath } });
import MarkdownViewer from '@/components/MarkdownViewer'; // 留덊겕?ㅼ슫 酉곗뼱 - 留덊겕?ㅼ슫 酉곗뼱
import Script from 'next/script'; // ?μ뒪???ㅽ겕由쏀듃 - 
import 'katex/dist/katex.min.css'; // 移댄뀓???ㅽ???- ?섑븰 怨듭떇 ?뚮뜑留?// import 'highlight.js/styles/github.css'; // 肄붾뱶 ?섏씠?쇱씠???ㅽ???
/**
 * ==================================================================================
 * ?꾩씠肄??쇱씠釉뚮윭由?- lucide-react 
 * PanelLeft as SidebarIcon, FileText, Copy, Check, Folder, Plus, FolderPlus, Edit2,
  ChevronRight, ChevronDown, FileJson, FileCode, FileType, File, Trash2,
  Layers, X
 * ==================================================================================
 */
import {
  PanelLeft as SidebarIcon, FileText, Copy, Check, Folder, Plus, FolderPlus, Edit2,
  ChevronRight, ChevronDown, FileJson, FileCode, FileType, File, Trash2,
  Layers, X, Eraser, Sparkles, Loader2, Lock
} from 'lucide-react';

/**
 * ==================================================================================
 * ?꾨줈?앺듃 ?대? 紐⑤뱢 @媛 ?덈뒗 ?대? components 李몄“?좎뼵
 * ==================================================================================
 */
import { EditorProvider } from '@/context/EditorContext';
import { useMonacoSetup } from '@/hooks/editor/useMonacoSetup';
import { useUIStore } from '@/store/useUIStore';
import { useToast } from '@/components/ToastProvider';  // ?좎뒪??硫붿떆吏
import { msg } from '@/lib/systemMessages'; // 硫붿떆吏
import { getApiUrl } from '@/lib/apiUrlBuilder'; // api ?쒕쾭 寃쎈줈
import { exportPDF, exportHTML, exportEPUB, exportPNG } from '@/lib/exportHandlers'; // ?뚯씪 ?대낫?닿린 ?몃뱾??import { configureMonacoEnvironment } from '@/lib/monacoEnv'; // Monaco ?섍꼍 ?ㅼ젙
import { idb, FileNode, scanDirectory, getFileIcon } from '@/lib/indexedDbHelper'; // indexedDB ?ы띁
import { preprocessMarkdownForPreview, stripFrontmatter } from "@/lib/editorUtils"; // 留덊겕?ㅼ슫 ?꾨━酉?import { getSlashCommands, getDefaultHotkeys, getDefaultCommands, TOOLBAR_ITEMS } from "@/lib/toolbarConfig"; // ?대컮 ?ㅼ젙
import { EDITOR_THEMES, THEME_MAP } from "@/lib/editorThemes"; // ?먮뵒???뚮쭏
import { CssProfile } from "@/types/cssProfile"; // css ?꾨줈?????import { DEFAULT_PROFILE, SYSTEM_PROFILES, isSystemProfileId } from "@/constants/cssProfile"; // 湲곕낯 ?꾨줈??import { WELCOME_CONTENT } from "@/constants/welcomeContent"; // ?곗뺨 而⑦뀗痢?import { PAPER_SIZES } from "@/constants/paperSizes";
import { getWelcomeContent, saveWelcomeContent } from "@/constants/welcomeContent"; // ?곗뺨 而⑦뀗痢?import { getVfsFiles, vfsReadFile, vfsWriteFile, vfsCreateFile, vfsCreateFolder } from '@/lib/virtualFileSystem'; // 媛???뚯씪 ?쒖뒪???ы띁
import { processTextWithAI, processTextWithAIStream, generateDraftWithAIStream, AI_ACTIONS, AiActionType } from '@/lib/gemini'; // Gemini AI 紐⑤뱢
import FileTreeItem from '@/components/FileTreeItem'; // ?뚯씪 ?몃━ ?꾩씠??import ExportModal from '@/components/ExportModal'; // 紐⑤떖
import OAIcon from './icon_onriveauther.png'; // ?꾩씠肄?

// 遺꾨━??而댄룷?뚰듃???꾪룷??import MenuBar from '@/components/MenuBar'; // 硫붾돱諛?import Toolbar from '@/components/Toolbar'; // ?대컮

import StatusBar from '@/components/StatusBar'; // ?곹깭諛?import ImageModal from '@/components/ImageModal'; // 紐⑤떖
import MapModal from '@/components/MapModal'; // 紐⑤떖
import TableModal from '@/components/TableModal'; // 紐⑤떖
import SettingsModal from '@/components/SettingsModal'; // 紐⑤떖
import GlobalSearch from '@/components/GlobalSearch'; // 紐⑤떖
import LeftSidebar from '@/components/LeftSidebar'; // 紐⑤떖
import FormulaModal from '@/components/FormulaModal'; // 紐⑤떖
import MergeModal from '@/components/MergeModal'; // 紐⑤떖
import YoutubeModal from '@/components/YoutubeModal'; // 紐⑤떖
import AboutModal from '@/components/AboutModal'; // 紐⑤떖
import LicenseModal from '@/components/LicenseModal'; // ?쇱씠?좎뒪 紐⑤떖
import AIDraftModal from '@/components/AIDraftModal'; // 珥덉븞 ?앹꽦 紐⑤떖
import { supabase } from '@/lib/supabaseClient';
import { saveSecureData, loadSecureData } from '@/lib/secureStorage';
import UnifiedTabBar, { EditorTab } from '@/components/UnifiedTabBar';
import * as utilsPasteHandlers from '@/utils/pasteHandlers';
import * as utilsEditorActions from '@/utils/editorActions';
import { useEditorTabs } from '@/hooks/useEditorTabs';
import { useEditorSettings } from '@/hooks/useEditorSettings';
import { useEditorHandlers } from '@/hooks/useEditorHandlers';
import { useFileExplorer } from '@/hooks/useFileExplorer';

// ====================================================================
// ?? [由ы뙥?좊쭅 V2 ?닿? 以鍮? ?덈줈 ?앹꽦??紐⑤뱢 Import
// 湲곗〈 ?섎뱶肄붾뵫???곹깭? 酉곕? ???뚯씪?ㅻ줈 ?먯쭊?곸쑝濡?留덉씠洹몃젅?댁뀡?댁빞 ?⑸땲??
// ====================================================================
import { useEditorAuth } from '@/hooks/editor/useEditorAuth';
import { useEditorModals } from '@/hooks/editor/useEditorModals';
// import EditorLayout from '@/components/editor/layout/EditorLayout';
// import EditorCore from '@/components/editor/core/EditorCore';
import ModalManager from '@/components/editor/modals/ModalManager';
import { extractFrontmatter, updateCssProfileInFrontmatter } from '@/lib/frontmatter';


/**
 * ==================================================================================
 * ????좎뼵
 * ==================================================================================
 */

/**
 * @fileType 
 *  @File 
 *  @Description 
 *  @Link https://onrivi.com/documentation/workflow/workflow/20240320123456-editorcommandtypes
 *  @note @/app/page.tsx?먯꽌 紐낅졊?대? 吏곸젒 ?ъ슜?섎뒗 ???@/lib/editorCommandType.ts?먯꽌 ?뺤쓽??紐낅졊????낆쓣 ?ъ슜  
 *        紐⑤굹肄??먮뵒?곗쓽 紐낅졊?대? @/lib/editorCommandType.ts???뺤쓽??紐낅졊????낆쑝濡?留ㅽ븨?섏뿬 ?ъ슜  
 *        @/lib/editorCommandType.ts??@/app/page.tsx?먯꽌 ?ъ슜?섎뒗 紐⑤굹肄??먮뵒?곗쓽 紐낅졊?대? ?뺤쓽???뚯씪   
 */

export type EditorCommandType =
  | 'NEW_FILE' | 'OPEN_FILE' | 'SAVE' | 'SAVE_AS' | 'OPEN_WORKSPACE'                   //???뚯씪 ?쒖뒪??諛??낆텧???쒖뼱 (OS I/O Message)
  | 'PRINT' | 'EXPORT_HTML' | 'EXPORT_EPUB' | 'EXPORT_PNG' | 'EXIT'                    //??異쒕젰(Export) 諛?醫낅즺  
  | 'UNDO' | 'REDO' | 'FIND' | 'REPLACE' | 'ZOOM_IN' | 'ZOOM_OUT'                      //???몄쭛 諛?蹂닿린 ?쒖뼱
  | 'GLOBAL_SEARCH' | 'TOGGLE_HELP' | 'ERASER' | 'BOLD' | 'ITALIC'                       //???ㅽ????곸슜
  | 'STRIKETHROUGH' | 'INLINE_CODE' | 'H1' | 'H2' | 'H3' | 'H4' | 'H5' | 'H6'                 //???ㅽ????곸슜
  | 'HR' | 'ORDERED_LIST' | 'UNORDERED_LIST' | 'QUOTE' | 'CHECKLIST'                   //???ㅽ????곸슜
  | 'LINK' | 'IMAGE' | 'VIDEO' | 'MAP' | 'TABLE' | 'CODE' | 'LATEX' | 'CLEAN_DOC'       //???ㅽ????곸슜
  | 'YOUTUBE' | 'NOW' | 'CODE_BLOCK' | 'CHART' | 'MATH' | 'SETTINGS'                  //???ㅽ????곸슜
  | 'ABOUT' | 'LICENSE' | 'TOGGLE_FLOATING_TOOLBAR' | 'OPEN_EXPORT' | 'REMOVE_PREFIX' | 'LIST' | 'CHECK' | 'COPY_ALL'  //???ㅽ????곸슜
  | 'TOGGLE_TOOLBAR' | 'TOGGLE_SIDEBAR' | 'TOGGLE_MODE' | 'TOGGLE_THEME'                  //???ㅽ????곸슜 
  | 'WRAP_H1' | 'WRAP_H2' | 'WRAP_H3' | 'WRAP_QUOTE' | 'WRAP_CODE'                       // ???ㅽ????곸슜 
  | 'TOGGLE_CSS_STYLE' | 'SETTINGS_SHORTCUTS'                                                                // ???ㅽ????곸슜 
  | 'FOOTNOTE' | 'ORGANIZE_FOOTNOTES'                                                                         // ??媛곸＜ ?쎌엯 
  | 'INSERT_TABLE_ROW' | 'DELETE_TABLE_ROW'                                               // ???????몄쭛 紐낅졊
  | 'DOCLINK'                                                                          // ??臾몄꽌留곹겕
  | 'MERGE'                                                                             // ???뚯씪 蹂묓빀
  | 'AI_HELP'                                                                           // ??AI 湲?곌린 ?꾩슦誘?  | 'ADD_REFERENCE'                                                                     // ??李몄“ ?뚯씪 異붽?
  | 'AI_DRAFT' | 'OPEN_AI_WRITER' | 'SLASH_COMMAND' | 'AUTO_RENUMBER';

// 紐⑤뱢 ?덈꺼 Monaco ?ㅼ젙: 而댄룷?뚰듃 ?뚮뜑 ?꾩뿉 loader 寃쎈줈 ?뺤젙 (?덉씠??而⑤뵒??諛⑹?)
if (typeof window !== 'undefined') { // @window : 釉뚮씪?곗??먯꽌留??ъ슜?섎뒗 媛앹껜, @undefined : 釉뚮씪?곗?媛 ?꾨땶 ?섍꼍(Node.js ???먯꽌 ?ъ슜?섎뒗 媛?
  const addonQuery = new URLSearchParams(window.location.search).get('env') === 'addon'; // @addonQuery : ?섍꼍 蹂??
  const addonRuntime = !!((window as any).chrome?.runtime?.id); // @addonRuntime : ?섍꼍 蹂??

  // ?щ＼ ?뺤옣 ?꾨줈洹몃옩 ?섍꼍?먯꽌留?Monaco loader 寃쎈줈瑜??ㅼ젙 (?덉씠??而⑤뵒??諛⑹?)
  if (addonQuery || addonRuntime) { // @addonQuery : ?섍꼍 蹂?? @addonRuntime : ?섍꼍 蹂??
    const getExtensionUrl = (relativePath: string) => { // @getExtensionUrl : ?섍꼍 蹂??
      if (typeof (window as any).chrome?.runtime?.getURL === 'function') { // @getExtensionUrl : ?섍꼍 蹂??
        return (window as any).chrome.runtime.getURL(relativePath); // @getExtensionUrl : ?섍꼍 蹂??
      }
      return relativePath; // @getExtensionUrl : ?섍꼍 蹂??
    };
    (window as any).MonacoEnvironment = {
      getWorkerUrl: function (_moduleId: string, label: string) { // @getWorkerUrl : ?섍꼍 蹂??
        // ?썳截??щ＼ ?뺤옣 ?꾨줈洹몃옩 MV3??CSP(script-src 'self') ?쒖빟 ?섏뿉?쒕뒗
        // ?숈씪 origin??濡쒖뺄 ?⑦궎吏 ?댁쓽 vs/base/worker/workerMain.js 寃쎈줈瑜??ㅼ씠?됲듃濡?諛섑솚?섏뿬
        // ?숈씪 origin(chrome-extension://) ?섏뿉 ?뚯빱 而⑦뀓?ㅽ듃瑜??앹꽦?댁빞 ?대? importScripts 濡쒕뱶媛 李⑤떒?섏? ?딆뒿?덈떎.
        return getExtensionUrl('/monaco-editor/min/vs/base/worker/workerMain.js');
      }
    };
    try {
      const vsPath = getExtensionUrl('/monaco-editor/min/vs');
      loader.config({ paths: { vs: vsPath } });
    } catch (err) {
      showToast('?먮뵒??濡쒕뱶 ?ㅽ뙣. ?ㅽ봽?쇱씤 紐⑤뱶濡??덉쟾 蹂듦뎄?⑸땲??', 'warning');
    }
  } else {
    // ?뙋 Electron / Local Web: 濡쒖뺄 ?먮뒗 CDN Monaco ?뚯빱 ?ㅼ젙
    configureMonacoEnvironment();
  }
}


/**
 * @file 
 * @description 珥덇린 留덊겕?ㅼ슫 ?띿뒪??
 * @note @/app/page.tsx?먯꽌 ?ъ슜?섎뒗 珥덇린 留덊겕?ㅼ슫 ?띿뒪???뺤쓽  
 *       紐⑤굹肄??먮뵒?곗쓽 珥덇린 留덊겕?ㅼ슫 ?띿뒪?몃줈 ?ъ슜?? */


// ====================================================================
// ?뱤 [OMD-FILE-MainEditorApp-0000] MainEditorApp.tsx ??parseDateStringToMs
// ?렞 @KICK  : ?좎쭨 臾몄옄??YYYYMMDD ?먮뒗 ISO)??ms ??꾩뒪?ы봽濡??덉쟾?섍쾶 ?뚯떛
// ====================================================================
export const parseDateStringToMs = (str?: string): number => {
  if (!str) return 0;
  if (str === '99991231') return Number.MAX_SAFE_INTEGER;
  if (/^\d{8}$/.test(str)) {
    const y = parseInt(str.substring(0, 4), 10);
    const m = parseInt(str.substring(4, 6), 10) - 1;
    const d = parseInt(str.substring(6, 8), 10);
    return new Date(y, m, d, 23, 59, 59, 999).getTime();
  }
  const parsed = new Date(str).getTime();
  return isNaN(parsed) ? 0 : parsed;
};

// ====================================================================
// ?뱤 [OMD-FILE-MainEditorApp-0001] MainEditorApp.tsx ??getMdFiles
// ?렞 @KICK  : FileNode ?몃━瑜??쒗쉶?섏뿬 紐⑤뱺 .md ?뚯씪???ш??곸쑝濡??섏쭛?⑸땲??// ?썳截?@GUARD : None
// ?슚 @PATCH : **2026-08-20** ?섎떒 ?대컮??媛?ㅼ?吏 ?딅룄濡?preview-page-sheet 諛?custom-preview-container ?섎떒 ?щ갚(padding-bottom) ????뺣?.
// ?슚 @PATCH : None
// ?뵕 @CALLS : None
// ====================================================================
const getMdFiles = (nodes: FileNode[]): FileNode[] => {
  const result: FileNode[] = [];
  const traverse = (list: FileNode[]) => {
    for (const node of list) {
      if (node.kind === 'file') {
        const ext = node.name.split('.').pop()?.toLowerCase();
        if (ext === 'md' && node.path) {
          result.push(node);
        }
      } else if (node.kind === 'directory' && node.children) {
        traverse(node.children);
      }
    }
  };
  traverse(nodes);
  return result;
};

// ====================================================================
// ?뱤 [OMD-FILE-MainEditorApp-0002] MainEditorApp.tsx ??fetchAllMdFiles
// ?렞 @KICK  : 硫???뚮옯??鍮꾨룞湲??뚯씪 ?몃━ ?ㅼ틪: 釉뚮씪?곗?, 濡쒖뺄/Electron ?먮뒗 ?대씪?곕뱶 API
// ?썳截?@GUARD : visited Set?쇰줈 臾댄븳 ?붾젆?좊━ 猷⑦봽 ?ъ씠??諛⑹?
// ?슚 @PATCH : None
// ?뵕 @CALLS : getMdFiles, fetch, api.listDirectory
// ====================================================================
const fetchAllMdFiles = async (
  workspaceType: string,
  fileList: FileNode[],
  rootFolder: { name: string; handle?: any } | null
): Promise<FileNode[]> => {
  const api = (window as any).electronAPI;

  if (workspaceType === 'browser') {
    return getMdFiles(fileList);
  }

  if (workspaceType === 'local') {
    if (api?.listDirectory && rootFolder?.name) {
      const allFiles: FileNode[] = [];
      const visited = new Set<string>();

      const scan = async (dirPath: string) => {
        if (visited.has(dirPath)) return;
        visited.add(dirPath);
        try {
          const list: FileNode[] = await api.listDirectory(dirPath);
          for (const item of list) {
            if (item.kind === 'file') {
              const nameLower = item.name.toLowerCase();
              if (nameLower.endsWith('.md') || nameLower.endsWith('.markdown') || nameLower.endsWith('.bib')) {
                allFiles.push(item);
              }
            } else if (item.kind === 'directory' && item.path) {
              await scan(item.path);
            }
          }
        } catch (e) {
          console.error('[fetchAllMdFiles] scan error for path:', dirPath, e);
        }
      };

      await scan(rootFolder.name);
      return allFiles;
    }

    try {
      const res = await fetch(getApiUrl(`/api/files?t=${Date.now()}`));
      if (res.ok) {
        const list = await res.json();
        return getMdFiles(list);
      }
    } catch (err) {
      console.error('[fetchAllMdFiles] fetch full files error:', err);
    }
  }

  return getMdFiles(fileList);
};

// ====================================================================
// ?뱤 [OMD-CORE-MainEditorApp-0003] MainEditorApp.tsx ??resolveRelativeImagePath
// ?렞 @KICK  : ?곷? 留덊겕?ㅼ슫 ?대?吏 寃쎈줈瑜??덈? 寃쎈줈濡?蹂?? 諛깆뒳?섏떆 諛?../.. ?멸렇癒쇳듃 ?뺢퇋??// ?썳截?@GUARD : http/https/data/blob URI, Windows ?쒕씪?대툕 臾몄옄, 鍮?src 泥섎━
// ?슚 @PATCH : None
// ?뵕 @CALLS : None
// ====================================================================
const resolveRelativeImagePath = (srcPath: string, currentFileNodePath: string | undefined): string => {
  if (!srcPath) return "";   // @srcPath : ?대?吏 寃쎈줈 

  if (srcPath.startsWith('http://') || srcPath.startsWith('https://') || srcPath.startsWith('data:') || srcPath.startsWith('blob:')) {
    return srcPath;   // @srcPath : ?덈? 寃쎈줈 (?몃? 留곹겕, data URI, blob URI ?? 
  }

  // ?뮕 [?덈룄???덈? 寃쎈줈 諛⑹뼱] ?쒕씪?대툕 臾몄옄(D:/)???덈? 寃쎈줈濡??쒖옉?섎㈃ 洹몃?濡?諛섑솚?⑸땲??
  const normalizedSrc = srcPath.replace(/\\/g, '/');
  const isAbsolute = /^[a-zA-Z]:\//.test(normalizedSrc) || normalizedSrc.startsWith('/');
  if (isAbsolute) {
    return normalizedSrc;
  }

  // @currentFileNodePath : ?꾩옱 ?뚯씪???몃뱶 寃쎈줈 
  let baseFolder = "";
  if (currentFileNodePath) {
    const normalizedFile = currentFileNodePath.replace(/\\/g, '/'); // @normalizedFile : ?꾩옱 ?뚯씪???몃뱶 寃쎈줈 (?뺢퇋??
    const lastSlash = normalizedFile.lastIndexOf('/'); // @lastSlash : ?꾩옱 ?뚯씪???몃뱶 寃쎈줈?먯꽌 留덉?留??щ옒?쒖쓽 ?꾩튂 
    if (lastSlash !== -1) {
      baseFolder = normalizedFile.substring(0, lastSlash); // @baseFolder : ?꾩옱 ?뚯씪???몃뱶 寃쎈줈?먯꽌 留덉?留??щ옒???댁쟾??寃쎈줈 
    }
  }

  // @cleanSrc : ?대?吏 寃쎈줈 (?뺢퇋?? 
  let cleanSrc = srcPath.replace(/\\/g, '/'); // @cleanSrc : ?대?吏 寃쎈줈 (?뺢퇋?? 
  if (cleanSrc.startsWith('/')) {
    cleanSrc = cleanSrc.substring(1); // @cleanSrc : ?대?吏 寃쎈줈 (?뺢퇋?? 
  }

  if (cleanSrc.startsWith('./')) {
    cleanSrc = cleanSrc.substring(2); // @cleanSrc : ?대?吏 寃쎈줈 (?뺢퇋?? 
  }

  // @finalPath : ?대?吏 寃쎈줈 (?덈? 寃쎈줈) 
  let finalPath = "";
  if (baseFolder) {
    finalPath = baseFolder + '/' + cleanSrc; // @finalPath : ?대?吏 寃쎈줈 (?덈? 寃쎈줈) 
  } else {
    finalPath = cleanSrc; // @finalPath : ?대?吏 寃쎈줈 (?덈? 寃쎈줈) 
  }

  // @segments : ?대?吏 寃쎈줈 (遺꾩꽍??寃쎈줈) 
  const segments = finalPath.split('/');
  const stack: string[] = [];
  for (const seg of segments) {
    if (seg === '.' || seg === '') continue; // @seg : ?대?吏 寃쎈줈 (遺꾩꽍??寃쎈줈) 
    if (seg === '..') {
      stack.pop(); // @stack : ?대?吏 寃쎈줈 (遺꾩꽍??寃쎈줈) 
    } else {
      stack.push(seg); // @stack : ?대?吏 寃쎈줈 (遺꾩꽍??寃쎈줈) 
    }
  }

  return stack.join('/'); // @stack : ?대?吏 寃쎈줈 (遺꾩꽍??寃쎈줈) 
};

// ====================================================================
// ?뱤 [OMD-CORE-MainEditorApp-0004] MainEditorApp.tsx ??getRelativePath
// ?렞 @KICK  : ?꾪궎 ?ㅽ???臾몄꽌 留곹겕瑜??꾪븳 ???뚯씪 媛??곷? 寃쎈줈 怨꾩궛
// ?썳截?@GUARD : null fromPath 泥섎━, ?덈? 寃쎈줈媛 ?꾨땲硫?./濡??쒖옉?섎룄濡?蹂댁옣
// ?슚 @PATCH : None
// ?뵕 @CALLS : None
// ====================================================================
const getRelativePath = (fromPath: string | null | undefined, toPath: string): string => {
  if (!fromPath) {
    return toPath.startsWith('/') || toPath.startsWith('.') ? toPath : `./${toPath}`;
  }
  const normFrom = fromPath.replace(/\\/g, '/');
  const normTo = toPath.replace(/\\/g, '/');
  const fromParts = normFrom.split('/').filter(Boolean);
  const toParts = normTo.split('/').filter(Boolean);

  // ?뚯씪紐낆쓣 ?쒖쇅???대뜑 寃쎈줈留?異붿텧
  fromParts.pop();

  let commonIndex = 0;
  while (commonIndex < fromParts.length && commonIndex < toParts.length && fromParts[commonIndex] === toParts[commonIndex]) {
    commonIndex++;
  }

  const upCount = fromParts.length - commonIndex;
  const upParts = Array(upCount).fill('..');
  const downParts = toParts.slice(commonIndex);

  const relParts = [...upParts, ...downParts];
  let relPath = relParts.join('/');
  if (!relPath.startsWith('.') && !relPath.startsWith('/')) {
    relPath = './' + relPath;
  }
  return relPath;
};

// ====================================================================
// ?뱤 [OMD-CORE-MainEditorApp-0005] MainEditorApp.tsx ??MainEditorApp
// ?렞 @KICK  : 而⑦듃濡???? 紐⑤뱺 ?꾩뿭 ?곹깭, ?덉씠?꾩썐 議곕┰, Monaco ?먮뵒?? 誘몃━蹂닿린, ?ъ씠?쒕컮, 硫붾돱 議곗젙
// ?썳截?@GUARD : TDZ ?좎뼵 ?쒖꽌 諛⑹뼱, IME 議고빀 ?좉툑, ?ㅽ뀒???대줈? Ref 諛깆뾽, 留덉슫?????덉씠??而⑤뵒??媛??// ?슚 @PATCH : **2026-07-16** ??遺꾪븷 ?붾㈃ 紐⑤뱶?먯꽌 CSS ?뚮쭏 諛곌꼍?됱씠 諛섏쁺?섏? ?딄퀬 ?곗깋?쇰줈 濡ㅻ갚?섎뜕 寃고븿 ?섏젙 (紐⑤뱺 誘몃━蹂닿린 紐⑤뱶??諛곌꼍?됱씠 ?곸슜?섎룄濡?CSS ?ㅻ쾭?쇱씠??媛??議곗튂).
//             **2026-07-05** ??MainEditorApp???섎뱶肄붾뵫??UI 猿띾뜲湲?MenuBar, LeftSidebar ??6醫? Props ?섏〈?깆쓣 ?꾨㈃ ?쒓굅?섍퀬 EditorContext濡?留덉씠洹몃젅?댁뀡?섏뿬 紐⑤뱢???꾪궎?띿쿂 媛쒗렪; ?꾨옒 ?곸꽭 ?섏쐞 ??ぉ 李몄“
// ?뵕 @CALLS : useToast, useEditorTabs, useFileExplorer, useEditorSettings, useEditorHandlers, getMdFiles, fetchAllMdFiles, resolveRelativeImagePath, getRelativePath, utilsEditorActions, utilsPasteHandlers, getSlashCommands, preprocessMarkdownForPreview, saveSecureData, loadSecureData, idb, getApiUrl
// ====================================================================
export default function MainEditorApp() {                  // @MainEditorApp : MainEditorApp component
  const { showToast } = useToast();             // @showToast : Toast component  
  const {
    isSidebarOpen, setIsSidebarOpen,
    isToolbarOpen, setIsToolbarOpen,
    sidebarWidth, setSidebarWidth,
    sidebarTab, setSidebarTab
  } = useUIStore();
  const [mounted, setMounted] = useState(false);  // @mounted : mounted state 
  const [content, setContent] = useState('');   // @content : content state 

  const contentRef = useRef(content);
  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0006] MainEditorApp.tsx ??contentRef_sync
  // ?렞 @KICK  : ?대줈??먯꽌 ?ъ슜?섍린 ?꾪빐 contentRef.current瑜?content ?곹깭? ?숆린??  // ?썳截?@GUARD : ?ㅽ뀒???대줈?媛 ref?먯꽌 ?댁쟾 肄섑뀗痢좊? ?쎈뒗 寃껋쓣 諛⑹?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => {
    contentRef.current = content;
  }, [content]);

  const [previewMode, setPreviewModeRaw] = useState<'edit' | 'both' | 'preview' | 'css-style'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('previewMode');
      if (saved && saved !== 'css-style') return saved as any;
    }
    return 'both';
  });
  const [isA4GuardEnabled, setIsA4GuardEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('isA4GuardEnabled') === 'true';
    }
    return false;
  });
  const [previewZoomScale, setPreviewZoomScale] = useState<number>(1);
  const previewModeRef = useRef(previewMode);
  // ?뮕 ?쒖떇?ㅼ젙(css-style)?대굹 ?꾩?留?吏꾩엯 ?꾩쓽 ?쇰컲 留덊겕?ㅼ슫 紐⑤뱶瑜?寃⑸━ 蹂닿??섏뿬 蹂듭썝?섎뒗 Ref
  const lastGeneralPreviewModeRef = useRef<'edit' | 'both' | 'preview'>('both');
  const isEditorMountedRef = useRef(false);

  // ====================================================================
  // ?뱤 [OMD-CORE-0003 TDZ-GUARD] MainEditorApp.tsx ?????몄텧 ???좏뻾 ?곹깭 ?좎뼵 釉붾줉
  // ?렞 @KICK  : useEditorSettings/useEditorTabs ???몄텧 ?댁쟾??諛섑솚媛믪쓣 李몄“?섎뒗
  //             ?섏쐞 肄붾뱶(useEffect ??瑜??꾪빐 紐⑤뱺 愿???곹깭瑜?const濡??좏뻾 ?좎뼵
  // ?썳截?@GUARD : Webpack 踰덈뱾?ш? let 蹂?섎? ?⑥씪 湲??rS, r0 ??濡??쒕룆????TDZ ?먮윭 ?좊컻 ??const濡?利됱떆 珥덇린??  // ?슚 @PATCH : _init ?붾? 蹂???⑦꽩 ?꾩엯 (useEditorSettings 遺꾨━ 由ы뙥?좊쭅) | ?댁쟾 踰꾩쟾
  //           | tabs/setTabs/activeTabId/setActiveTabId瑜??ㅼ젣 ?대쫫?쇰줈 ?좏뻾 ?좎뼵, useEditorTabs ?몃? 二쇱엯 ?꾪솚 | 2026-06-15 | rS TDZ ?먮윭(tabMetadata_sync L526) ?닿껐
  // ?뵕 @CALLS : useState (React)
  // ====================================================================
  // ?뮕 [TDZ 諛⑹뼱] 紐⑤뱺 ?곹깭瑜?利됱떆 const濡??좎뼵?섏뿬 Webpack 踰덈뱾?ъ쓽 TDZ 理쒖쟻???ㅻ쪟 諛⑹?
  // ?댄썑 useEditorSettings ???몄텧 ???대떦 ?낆쓽 諛섑솚媛믪쑝濡?援ъ“遺꾪빐 ?ъ꽑?명븯吏 ?딄퀬,
  // 而댄룷?뚰듃 ?댁뿉??useEditorSettingsResult.xxx ?뺥깭濡?吏곸젒 ?묎렐?⑸땲??
  const [_isDarkMode_init, _setIsDarkMode_init] = useState(false);
  const [_fontSize_init, _setFontSize_init] = useState<number>(14);
  const [_wordWrap_init, _setWordWrap_init] = useState<'on' | 'off'>('on');
  const [_autoSave_init, _setAutoSave_init] = useState(true);
  const [_quoteStyle_init, _setQuoteStyle_init] = useState<'modern' | 'clean' | 'none'>('modern');
  const [_themePalette_init, _setThemePalette_init] = useState<string>('onrivi-light');
  const [_licenseKey_init, _setLicenseKey_init] = useState<string>('');
  const [_customHotkeys_init, _setCustomHotkeys_init] = useState<Record<string, string>>({});
  const [_customSlashCommands_init, _setCustomSlashCommands_init] = useState<Record<string, string>>({});
  const _customSlashCommandsRef_init = useRef<Record<string, string>>({});
  const _handleThemeChange_init = () => { };

  // ?뮕 [Step 1 由ы뙥?좊쭅 ?꾨즺] ?쇱씠?좎뒪 諛?沅뚰븳 愿由щ? 蹂꾨룄 Hook?쇰줈 ?꾩쟾??遺꾨━!
  const {
    deviceId, setDeviceId,
    licenseStatus, setLicenseStatus,
    isLicenseChecking, setIsLicenseChecking
  } = useEditorAuth();

  // ?뮕 [沅뚰븳 湲곕컲 ?쒗븳?ъ슜???먮퀎 ?뚮옒洹? ?ъ슜 湲곌컙 留뚮즺 ?먮뒗 ?숈떆 ?묒냽 珥덇낵, ?뱀? 誘몄씤利??쒗븳 ?뚮옖 ?ъ슜 ?щ?瑜??먮퀎
  const isRestrictedUser = useMemo(() => {
    return licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('誘몄씤利?) ||
      licenseStatus.planName?.includes('?쒗븳?ъ슜??);
  }, [licenseStatus.isExpired, licenseStatus.isRestricted, licenseStatus.planName]);

  // ?뮕 [Step 2 由ы뙥?좊쭅 ?꾨즺] ?섏떗 媛쒖뿉 ?ы븯??紐⑤떖/?앹뾽 ?곹깭瑜????섎굹??Hook?쇰줈 ?꾩쟾??遺꾨━!
  const {
    isSettingsModalOpen, setIsSettingsModalOpen,
    settingsModalInitialTab, setSettingsModalInitialTab,
    isStyleModalOpen, setIsStyleModalOpen,
    isExportModalOpen, setIsExportModalOpen,
    isImageModalOpen, setIsImageModalOpen,
    editingImageInfo, setEditingImageInfo,
    isMapModalOpen, setIsMapModalOpen,
    isTableModalOpen, setIsTableModalOpen,
    isMergeModalOpen, setIsMergeModalOpen,
    isYoutubeModalOpen, setIsYoutubeModalOpen,
    youtubeInitialUrl, setYoutubeInitialUrl,
    isLicenseModalOpen, setIsLicenseModalOpen,
    isFormulaModalOpen, setIsFormulaModalOpen,
    isHelpModalOpen, setIsHelpModalOpen,
    isReferenceModalOpen, setIsReferenceModalOpen,
    isCitationModalOpen, setIsCitationModalOpen,
    promptConfig, setPromptConfig,
    confirmConfig, setConfirmConfig
  } = useEditorModals();

  // ====================================================================
  // ?뱤 [OMD-EDIT-0004 TDZ-GUARD] MainEditorApp.tsx ??tabs/activeTabId ?좏뻾 ?좎뼵
  // ?렞 @KICK  : tabMetadata_sync(L526)媛 useEditorTabs ???몄텧(L935) ?댁쟾??setTabs/activeTabId瑜?  //             李몄“?섎?濡? Webpack TDZ ?먮윭 諛⑹?瑜??꾪빐 ?ㅼ젣 ?대쫫?쇰줈 理쒖긽???좏뻾 ?좎뼵
  // ?썳截?@GUARD : useEditorTabs ?대??먯꽌 useState瑜?媛뽰? ?딄퀬 ???곹깭瑜?二쇱엯諛쏆븘 ?ъ슜
  // ?슚 @PATCH : _tabs_init/_activeTabId_init ?붾? ?대쫫 ??tabs/activeTabId ?ㅼ젣 ?대쫫?쇰줈 蹂寃?| 2026-06-15 | rS TDZ(tabMetadata_sync) ?닿껐
  // ?뵕 @CALLS : useState (React)
  // ====================================================================
  // ?뮕 [珥덇린???쒖꽌 諛⑹뼱] useEditorTabs 諛섑솚 諛붿씤?????섏쐞 ?⑥닔?ㅼ씠 李몄“?섎뒗 ??愿由??곹깭???좏뻾 ?좎뼵
  const [tabs, setTabs] = useState<any[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const tabsRef = useRef<any[]>([]);
  const activeTabIdRef = useRef<string | null>(null);

  // ?뮕 誘몃━蹂닿린 ?낅뜲?댄듃 吏???붾컮?댁뒪 ??대㉧ Ref (??댄븨 ??踰덉찉嫄곕┝/源쒕묀嫄곕┝ 諛⑹뇙)
  const previewDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // ?뮕 [IME ??媛?? ?쒓? IME 議고빀 吏꾪뻾 ?щ?瑜???ν븯??Ref
  const isComposingRef = useRef(false);



  // ?뮕 [SYNC-03 / ?붽뎄?ы빆 3] ?묐갑???ㅽ겕濡?愿???뺢? 猷⑦봽 ?먯쿇 李⑤떒???꾪빐 ?몃쾭 媛먯? Ref ?꾩엯
  const isEditorHovered = useRef(false);
  const isPreviewHovered = useRef(false);



  const [activeLine, setActiveLine] = useState<number | null>(null); // @activeLine : active line state 
  const lastSelectionRef = useRef<any>(null);    // @lastSelectionRef : last selection state 
  /*
   * profiles state ??CssProfile 諛곗뿴
   * - ?쒖뒪???꾨줈??SYSTEM_PROFILES)? ??긽 ?욎뿉 怨좎젙
   * - ?ъ슜???꾨줈?? Addon ??localStorage, Desktop ??electronAPI(userData)
   */
  const [profiles, setProfiles] = useState<CssProfile[]>(() => {
    if (typeof window === 'undefined') return [...SYSTEM_PROFILES];
    // SSR ?댄썑: ?쒖뒪???꾨줈?꾨쭔 ?곗꽑 ?명똿, ?ъ슜???꾨줈?꾩? useEffect?먯꽌 鍮꾨룞湲?濡쒕뱶
    return [...SYSTEM_PROFILES];
  });
  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0007] MainEditorApp.tsx ??loadUserProfiles
  // ?렞 @KICK  : 留덉슫?????뚮옯????μ냼(electronAPI ?먮뒗 localStorage)?먯꽌 ?ъ슜??CSS ?꾨줈??濡쒕뱶
  // ?썳截?@GUARD : ?ъ슜??????곗씠?곗뿉???쒖뒪???꾨줈???꾪꽣留? ?덇굅???뺤떇 留덉씠洹몃젅?댁뀡 蹂묓빀
  // ?슚 @PATCH : 2026-08-05 ???밴낵 ?곗뒪?ы깙 ?섍꼍 紐⑤몢 臾댁“嫄?`profiles/userCssProfiles.json` 寃쎈줈瑜??듯빀?섏뿬 ?쒖떇 濡쒕뱶/??ν븯?꾨줉 ?쒖???
  // ?뵕 @CALLS : api.readProfiles, localStorage.getItem, JSON.parse, setProfiles
  // ====================================================================
  useEffect(() => {
    if (!mounted) return;
    const api = (window as any).electronAPI;
    const loadUserProfiles = async () => {
      let userProfiles: CssProfile[] = [];
      if (api) {
        // Desktop: electronAPI
        const savedResourceFolder = loadSecureData('resourceFolder') || null;
        userProfiles = await api.readProfiles(savedResourceFolder);
      } else {
        // Addon/Browser: localStorage & File System Access API
        try {
          const handle = await idb.get('resourceFolderHandle');
          if (handle) {
            setResourceFolderHandle(handle);
            try {
              // 沅뚰븳 ?뺤씤 ?놁씠 ?쎄린 ?쒕룄 (?щ＼? ?몄뀡 ?댁뿉?쒕뒗 ?덉슜?????덉쓬)
              const profilesDir = await handle.getDirectoryHandle('profiles', { create: false });
              const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: false });
              const file = await fileHandle.getFile();
              const text = await file.text();
              const parsed = JSON.parse(text);
              if (Array.isArray(parsed)) userProfiles = parsed;
              (window as any)._resourceFolderSynced = true; // ?쎄린 沅뚰븳 ?띾뱷 ?깃났
            } catch (err: any) {
              if (err.name === 'NotFoundError') {
                // ?뚯씪?대굹 ?대뜑媛 ?놁쓣 肉?沅뚰븳? ?덈뒗 ?곹깭?대?濡??숆린???덉슜
                (window as any)._resourceFolderSynced = true;
              }
              console.warn('[loadUserProfiles] Failed to read from resource folder handle, falling back to localStorage:', err);
              // 沅뚰븳???녾굅???뚯씪???녿뒗 寃쎌슦 ?꾨옒 localStorage 濡쒖쭅?쇰줈 ?대갚
            }
          }
        } catch (err) {
          console.warn('[loadUserProfiles] Failed to get resourceFolderHandle from idb:', err);
        }

        if (userProfiles.length === 0) {
          try {
            const saved = localStorage.getItem('userCssProfiles');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) userProfiles = parsed;
            } else {
              // 援щ쾭??留덉씠洹몃젅?댁뀡
              const oldSaved = localStorage.getItem('cssProfiles');
              if (oldSaved) {
                const parsed = JSON.parse(oldSaved);
                if (Array.isArray(parsed)) {
                  userProfiles = (parsed as CssProfile[]).filter(p => !isSystemProfileId(p.id) && p.id !== 'default');
                }
                localStorage.removeItem('cssProfiles');
              }
            }
          } catch { }
        }
      }
      setProfiles(prev => {
        const systemPart = prev.filter(p => isSystemProfileId(p.id));
        return [...systemPart, ...userProfiles];
      });
      setIsProfilesLoaded(true);
    };
    loadUserProfiles();
  }, [mounted]);
  const [activeProfileId, setActiveProfileId] = useState<string>(
    () => SYSTEM_PROFILES[0].id
  );
  const [isProfilesLoaded, setIsProfilesLoaded] = useState(false);
  const [isAddonEnv, setIsAddonEnv] = useState(false);
  const [helpContent, setHelpContent] = useState<string | null>(null);
  const [helpTitle, setHelpTitle] = useState('');
  const helpContentRef = useRef(helpContent);
  helpContentRef.current = helpContent;

  // ?뙚 議댁옱?섏? ?딅뒗 ??젣???뚮쭏(?꾨줈?? ID媛 localStorage???⑥븘?덉쓣 寃쎌슦 
  // ?쒖뒪??湲곕낯 ?꾨줈?꾨줈 ?먮룞 蹂듦뎄?섏뿬 ?뚮쭏 李뚭볼湲곕? ?덉쟾?섍쾶 ?뚭굅?⑸땲??
  useEffect(() => {
    if (isProfilesLoaded && activeProfileId) {
      const exists = profiles.some(p => p.id === activeProfileId);
      if (!exists) {
        setActiveProfileId(SYSTEM_PROFILES[0].id);
      }
    }
  }, [isProfilesLoaded, profiles, activeProfileId]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0008] MainEditorApp.tsx ??previewModeRef_sync
  // ?렞 @KICK  : previewModeRef.current瑜?previewMode ?곹깭? ?숆린??  // ?썳截?@GUARD : ?대깽???몃뱾??諛?鍮꾨룞湲?肄쒕갚?먯꽌 ?ㅽ뀒??ref 諛⑹?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => {
    previewModeRef.current = previewMode;
  }, [previewMode]);



  const [rootFolder, setRootFolder] = useState<{ name: string, handle?: any } | null>(null);
  const [resourceFolder, setResourceFolder] = useState<string | null>(() => loadSecureData('resourceFolder') || null);
  const [resourceFolderHandle, setResourceFolderHandle] = useState<any>(null);
  const [fileList, setFileList] = useState<FileNode[]>([]);
  const [workspaceType, setWorkspaceType] = useState<'local' | 'cloud' | 'browser'>('local');
  const [currentFileName, setCurrentFileName] = useState<string>('???뚯씪.md');
  const [currentFileNode, setCurrentFileNode] = useState<FileNode | null>(null);
  const [bibContent, setBibContent] = useState<string>('');

  // ?뮕 [Step 2 由ы뙥?좊쭅?쇰줈 promptConfig ??젣??(useEditorModals濡??닿?)]

  const pendingExternalFileRef = useRef<string | null>(null); // ?덈룄???뚯씪 ?곌껐 寃쎈줈 (留덉슫?????뺣낫??
  const sessionRestoredRef = useRef<boolean>(false); // ?몄뀡 蹂듭썝 理쒖큹 1???ㅽ뻾 媛??  const [driveLetter, setDriveLetter] = useState('D:');

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0012] MainEditorApp.tsx ??tabMetadata_sync
  // ?렞 @KICK  : ?꾩옱 ?뚯씪 ?뺣낫媛 蹂寃쎈맆 ????硫뷀??곗씠??fileName, path, node) ?숆린??  // ?썳截?@GUARD : None
  // ?슚 @PATCH : 2026-08-05 ?????쒖옉 ??由ъ냼???대뜑 誘몄????덈궡 硫붿떆吏 ?쒖떆 濡쒖쭅 異붽? (hasShownResourceWarningRef)
  // ?뵕 @CALLS : setTabs
  // ====================================================================
  const hasShownResourceWarningRef = useRef(false);

  useEffect(() => {
    if (hasShownResourceWarningRef.current) return;
    const timer = setTimeout(() => {
      hasShownResourceWarningRef.current = true;
      const api = (window as any).electronAPI;
      const savedFolder = loadSecureData('resourceFolder');
      // ?곗뒪?ы깙? 臾몄옄??寃쎈줈 ?좊Т濡? ?뱀? ?몃뱾 ?좊Т濡??먮떒
      const isMissing = api ? !savedFolder : !resourceFolderHandle;
      if (isMissing) {
        showToast('?섍꼍?ㅼ젙??由ъ냼?ㅽ뤃?쒓? 誘몄??뺣릺???쒖떇怨?硫?곕??붿뼱瑜??ъ슜?????놁뒿?덈떎.', 'warning');
      }
    }, 1500); // 珥덇린 濡쒕뵫 ??1.5珥????뺤씤
    return () => clearTimeout(timer);
  }, [resourceFolderHandle, showToast]);

  // ====================================================================
  useEffect(() => {
    if (activeTabId) {
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? {
            ...t,
            name: t.path || t.model ? currentFileName : t.name,
            path: currentFileNode?.path || null,
            node: currentFileNode
          }
          : t
      ));
    }
  }, [currentFileName, currentFileNode, activeTabId]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0012b] MainEditorApp.tsx ??file:tab-renamed listener
  // ?렞 @KICK  : ?먯깋湲곗뿉???뚯씪/?대뜑 ?대쫫 蹂寃???????쓣 ?댁? ?딄퀬 湲곗〈 ??硫뷀??곗씠?곕쭔 媛깆떊
  // ?썳截?@GUARD : oldPath媛 ?꾩옱 ?대┛ ??낵 ?쇱튂?섍굅???섏쐞 寃쎈줈???ы븿???뚮쭔 ?숈옉
  // ?슚 @PATCH : **2026-07-06** ??異붽? (?대쫫 蹂寃???????씠 ?앷린??踰꾧렇 ?섏젙)
  // ?뵕 @CALLS : setCurrentFileName, setCurrentFileNode, setTabs
  // ====================================================================
  useEffect(() => {
    const handler = (e: Event) => {
      const { oldPath, newPath, newName, newHandle } = (e as CustomEvent).detail;
      if (!oldPath || !newPath) return;

      const normOld = oldPath.replace(/\\/g, '/');
      const normNew = newPath.replace(/\\/g, '/');

      // ?꾩옱 ?대┛ ?뚯씪??蹂寃쎈맂 ?뚯씪?닿굅??蹂寃쎈맂 ?대뜑 ?섏쐞???덉쓣 ??      setTabs(prev => prev.map(t => {
        const tabPath = (t.path || '').replace(/\\/g, '/');
        if (tabPath === normOld) {
          // ?뺥솗???대쫫 蹂寃쎈맂 ?뚯씪
          return { ...t, name: newName, path: newPath, node: { ...t.node, name: newName, path: newPath, ...(newHandle ? { handle: newHandle } : {}) } };
        } else if (tabPath.startsWith(normOld + '/')) {
          // ?대쫫 蹂寃쎈맂 ?대뜑???섏쐞 ?뚯씪
          const updatedPath = newPath + t.path.substring(oldPath.length);
          const updatedName = t.name; // ?뚯씪紐??먯껜??蹂寃??놁쓬
          return { ...t, path: updatedPath, node: { ...t.node, path: updatedPath } };
        }
        return t;
      }));

      // ?꾩옱 ?쒖꽦 ?뚯씪??媛깆떊
      setCurrentFileNode(prev => {
        if (!prev) return prev;
        const normCur = (prev.path || '').replace(/\\/g, '/');
        if (normCur === normOld) {
          return { ...prev, name: newName, path: newPath, ...(newHandle ? { handle: newHandle } : {}) };
        } else if (normCur.startsWith(normOld + '/')) {
          const updatedPath = newPath + (prev.path || '').substring(oldPath.length);
          return { ...prev, path: updatedPath };
        }
        return prev;
      });
      setCurrentFileName(prev => {
        const normCur = (currentFileNode?.path || '').replace(/\\/g, '/');
        if (normCur === normOld) return newName;
        return prev;
      });
    };
    window.addEventListener('file:tab-renamed', handler);
    return () => window.removeEventListener('file:tab-renamed', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFileNode]);

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAIDraftModalOpen, setIsAIDraftModalOpen] = useState(false);
  const [aiDraftInitialMode, setAiDraftInitialMode] = useState<'draft' | 'editorial'>('draft');
  const [aiEditorContext, setAiEditorContext] = useState<{ selectedText: string; fullText: string }>({ selectedText: '', fullText: '' });

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0013] MainEditorApp.tsx ??searchOpen_sidebar_behavior
  // ?렞 @KICK  : 湲濡쒕쾶 寃?됱씠 ?대┫ ???ъ씠?쒕컮 ?닿린 諛?寃????쑝濡??꾪솚
  // ?썳截?@GUARD : 寃?됱씠 ?ロ옄 ??(?ъ쟾??寃????씤 寃쎌슦) ?ъ씠?쒕컮 ??쓣 TOC濡??ъ꽕??  // ?슚 @PATCH : None
  // ?뵕 @CALLS : setIsSidebarOpen, setSidebarTab
  // ====================================================================
  useEffect(() => {
    if (isSearchOpen) {
      setIsSidebarOpen(true);
      setSidebarTab('search');
    } else if (sidebarTab === 'search') {
      setSidebarTab('toc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSearchOpen]);

  // ?뮕 [Step 2 由ы뙥?좊쭅?쇰줈 媛곸쥌 紐⑤떖 ?곹깭????젣??(useEditorModals濡??닿?)]
  const youtubeEditRangeRef = useRef<any>(null);

  const [showDocLinkPicker, setShowDocLinkPicker] = useState(false);
  const [docLinkSearchText, setDocLinkSearchText] = useState('');
  const [allMdFiles, setAllMdFiles] = useState<FileNode[]>([]);
  const [isDocLinkLoading, setIsDocLinkLoading] = useState(false);

  // ?뮕 [?ㅻⅨ 臾몄꽌 ?ㅻ뵫 ?곌껐] ?ㅻ뵫 ?뚯떛 諛?UI 議곗옉???꾪븳 ?곹깭媛?  const [selectedDocNode, setSelectedDocNode] = useState<FileNode | null>(null);
  const [docHeadings, setDocHeadings] = useState<string[]>([]);
  const [isHeadingLoading, setIsHeadingLoading] = useState(false);
  const [docHeadingSearchText, setDocHeadingSearchText] = useState('');

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0014] MainEditorApp.tsx ??loadFilesForDocLinkPicker
  // ?렞 @KICK  : 臾몄꽌 留곹겕 ?좏깮湲??대┫ ??紐⑤뱺 .md ?뚯씪 濡쒕뱶, ?ロ옄 ???곹깭 ?뺣━
  // ?썳截?@GUARD : ?좏깮湲??ロ옄 ??紐⑤뱺 ?쒕ぉ/?뚯씪 ?좏깮 ?곹깭 珥덇린??  // ?슚 @PATCH : None
  // ?뵕 @CALLS : fetchAllMdFiles, setAllMdFiles
  // ====================================================================
  useEffect(() => {
    if (showDocLinkPicker) {
      const loadFiles = async () => {
        setIsDocLinkLoading(true);
        try {
          const files = await fetchAllMdFiles(workspaceType, fileList, rootFolder);
          setAllMdFiles(files);
          docLinkFilesRef.current = files;
        } catch (e) {
          console.error(e);
        } finally {
          setIsDocLinkLoading(false);
        }
      };
      loadFiles();
    } else {
      setAllMdFiles([]);
      setDocLinkSearchText('');
      setSelectedDocNode(null);
      setDocHeadings([]);
      setIsHeadingLoading(false);
      setDocHeadingSearchText('');
    }
  }, [showDocLinkPicker, workspaceType, fileList, rootFolder]);

  // ?뱤 [[ ?먮룞?꾩꽦???뚯씪 紐⑸줉 濡쒕뱶
  useEffect(() => {
    if (workspaceType && fileList.length > 0 && !showDocLinkPicker) {
      fetchAllMdFiles(workspaceType, fileList, rootFolder).then(files => {
        docLinkFilesRef.current = files;
      }).catch(() => { });
    }
  }, [workspaceType, fileList, rootFolder, showDocLinkPicker]);

  // ?뮕 [Step 2 由ы뙥?좊쭅?쇰줈 ?명똿 諛??ㅽ???紐⑤떖 ?곹깭 ??젣??(useEditorModals濡??닿?)]

  // ====================================================================
  // ?뱤 [OMD-AUTH-MainEditorApp-0015] MainEditorApp.tsx ??initDeviceId
  // ?렞 @KICK  : electronAPI, chrome.storage ?먮뒗 localStorage ?대갚?먯꽌 怨좎쑀 ?μ튂 ID 珥덇린??  // ?썳截?@GUARD : ?쒖꽌媛 ?ㅻⅨ ?섍꼍 泥섎━; 議댁옱?섏? ?딆쑝硫?crypto-random UUID ?앹꽦
  // ?슚 @PATCH : 2026-06-28 ???щ＼ ?ㅽ넗由ъ? ?숆린???꾩쟾 ?쒓굅 諛?濡쒖뺄?ㅽ넗由ъ? 寃⑸━濡??몄뀡 湲곕컲 ?묒냽 愿由??꾪솚
  // ?뵕 @CALLS : api.getMachineId, crypto.randomUUID, localStorage.getItem/setItem, setDeviceId
  // ====================================================================
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const initDeviceId = async () => {
      const api = (window as any).electronAPI;
      if (api && typeof api.getMachineId === 'function') {
        // A. ?곗뒪?ы깙 Electron ?ㅺ린湲?ID ?섏쭛
        const realId = await api.getMachineId();
        setDeviceId(realId);
      } else {
        // B. ?쇰컲 ??釉뚮씪?곗? (?ㅽ넗由ъ? ?숆린???꾩쟾 ?쒓굅 諛?濡쒖뺄?ㅽ넗由ъ? 寃⑸━)
        let localId = localStorage.getItem('onrivi_device_id');
        if (!localId) {
          localId = crypto.randomUUID();
          localStorage.setItem('onrivi_device_id', localId);
        }
        setDeviceId(localId);
      }
    };
    initDeviceId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ====================================================================
  // ?뱤 [OMD-AUTH-MainEditorApp-0016] MainEditorApp.tsx ??loadAndVerifyLicense (payment_no)
  // ?렞 @KICK  : ??μ냼?먯꽌 ?쇱씠?좎뒪 ??濡쒕뱶, Supabase DB濡?寃利? payment_no ?녿뒗 寃쎌슦 user_id fallback
  // ?썳截?@GUARD : ?뷀샇??罹먯떆瑜??듯븳 ?ㅽ봽?쇱씤 ?좎삁 湲곌컙(3??, ?쒓컙 議곗옉 諛⑹뼱; ??SaaS??count 議고쉶留?(upsert/?λ퉬 泥댄겕 ?놁쓬)
  // ?슚 @PATCH : 2026-06-28 ???뺤옣?꾨줈洹몃옩(chrome.storage.local) ?ㅽ넗由ъ? ?쎄린 濡쒖쭅 ?쒓굅 (濡쒖뺄?ㅽ넗由ъ? 寃⑸━);
  //              2026-06-23 ??payment_no 誘몄〈???쒖쓽 subscriptions ?대갚 荑쇰━???ㅼ쨷援щ룆 cardinality violation 諛⑹????쒖꽦 援щ룆 ?꾪꽣(is_expired/plan_end_date/plan_status ?? 異붽? 媛쒗렪;
  //              2026-06-22 ??payment_no 誘몄〈????supabase Auth ?몄뀡 ??subscriptions ??software_licenses fallback;
  //              ??SaaS: count 議고쉶留??섑뻾, upsert/device UUID ?꾩쟾 ?쒓굅 (auth callback?먯꽌 insert ?대떦)
  // ?뵕 @CALLS : api.loadLicenseFull, fetch(/api/rpc/license/insert, /api/license/check-session), crypto.subtle.digest, saveSecureData, loadSecureData, setLicenseStatus, setLicenseKey
  // ====================================================================
  const loadAndVerifyLicense = useCallback(async () => {
    if (typeof window === 'undefined' || !deviceId) return;
    console.log('[LICENSE] loadAndVerifyLicense START deviceId=%o', deviceId);
    const api = (window as any).electronAPI;
    const isDesktop = !!api;
    let savedKey = '';
    let savedPaymentNo = '';
    let savedUserId = '';
    let savedLastRunTime = 0;

    let savedNextPaymentDate = '';
    let savedLicenseKey = '';
    let savedPlanName = '';

    // A. ?ㅽ넗由ъ? 濡쒕뱶 (濡쒖뺄?ㅽ넗由ъ?瑜?理쒖슦???⑥씪 吏꾩떎 怨듦툒??SSOT)?쇰줈 ?ъ슜)
    savedKey = localStorage.getItem('onrivi_license_key') || '';
    savedUserId = localStorage.getItem('onrivi_user_id') || '';
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) savedUserId = session.user.id;
    } catch (e) {}
    savedPaymentNo = localStorage.getItem('onrivi_payment_no') || '';
    savedLastRunTime = parseInt(localStorage.getItem('onrivi_last_run_time') || '0', 10);

    const cachedStatus = loadSecureData<any>('onrivi_license_status');
    if (cachedStatus && cachedStatus.userId === savedUserId) {
      savedNextPaymentDate = cachedStatus.nextPaymentDate || '';
      savedPlanName = cachedStatus.planName || '';
      // 罹먯떆???쇱씠?좎뒪 ?ㅺ? ?덉쑝硫?蹂묓빀
      if (!savedKey && cachedStatus.licenseKey) savedKey = cachedStatus.licenseKey;
    }

    if (isDesktop) {
      if (typeof api.loadLicenseFull === 'function') {
        const fullData = await api.loadLicenseFull();
        if (fullData && fullData.userId) {
          savedUserId = fullData.userId || savedUserId;
          savedLastRunTime = fullData.lastRunTime || savedLastRunTime;
          savedNextPaymentDate = fullData.nextPaymentDate || savedNextPaymentDate;
          savedLicenseKey = fullData.licenseKey || savedKey;
          savedPlanName = fullData.planName || savedPlanName;
        }
      }
    } else {
      savedLicenseKey = savedKey;
    }

    const nowTime = Date.now();

    // B. ?쒓컙 議곗옉 媛??    if (savedLastRunTime > 0 && nowTime < savedLastRunTime) {
      showToast("?좑툘 濡쒖뺄 ?쒖뒪???쒓컙 議곗옉??媛먯??섏뿀?듬땲?? ?먮뵒???몄쭛 湲곕뒫???쒗븳?⑸땲??", "error");
      setLicenseStatus(prev => ({
        ...prev, isActivated: false, isExpired: true, planName: '?쒓컙 ??쟾 ?쒗븳 紐⑤뱶'
      }));
      return;
    }

    // ============================================
    // ?슚 ?곗뒪?ы깙 ?꾩슜 濡쒖쭅: 臾댁“嫄?DB 議고쉶 (USERID + DeviceID)
    // ============================================
    if (isDesktop) {
      // ?쒖뒪???ㅽ뻾 ?쒓컙 媛깆떊 諛?湲곗〈 ?쇱씠?좎뒪 ?ㅽ봽?쇱씤 ?좏겙 ?좎?
      if (typeof api.saveLicenseFull === 'function') {
        await api.saveLicenseFull({
          userId: savedUserId,
          lastRunTime: nowTime,
          nextPaymentDate: savedNextPaymentDate,
          licenseKey: savedLicenseKey,
          planName: savedPlanName
        });
      }

      if (!savedUserId) {
        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: '', licenseKey: '', paymentNo: '',
          planName: '?쒗븳?ъ슜??, nextPaymentDate: ''
        });
        return;
      }

      try {
        const verifyRes = await fetch(getApiUrl('/api/license/verify-desktop'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_email: savedUserId, p_device_uuid: deviceId })
        });
        const data = verifyRes.ok ? await verifyRes.json() : null;
        const error = !verifyRes.ok ? new Error('?쒕쾭 ?ㅻ쪟') : null;

        if (error || !data) {
          console.warn('[loadAndVerifyLicense] Desktop verification network error:', error);
          // ?ㅽ봽?쇱씤 ?좎삁湲곌컙(Grace Period) 寃利?(?ㅽ듃?뚰겕 ?ㅻ쪟 ?쒖뿉留??묐룞)
          if (savedNextPaymentDate) {
            const expiryMs = parseDateStringToMs(savedNextPaymentDate);
            const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
            if (remainingDays > 0) {
              console.log('[loadAndVerifyLicense] Offline grace period active. Days remaining:', remainingDays);
              showToast(`?ㅽ듃?뚰겕 ?ㅽ봽?쇱씤 紐⑤뱶濡??ㅽ뻾 以묒엯?덈떎. (援щ룆 留뚮즺源뚯? D-${remainingDays})`, "warning");
              setLicenseStatus({
                isActivated: true, isExpired: false, remainingDays,
                userId: savedUserId, licenseKey: savedLicenseKey, paymentNo: '',
                planName: savedPlanName || '?ㅽ봽?쇱씤 ?꾨━誘몄뾼 ?붽툑??,
                nextPaymentDate: savedNextPaymentDate
              });
              setIsLicenseChecking(false);
              return;
            }
          }
          setLicenseStatus({
            isActivated: false, isExpired: true, remainingDays: 0,
            userId: savedUserId, licenseKey: '', paymentNo: '',
            planName: '?쒗븳?ъ슜??, nextPaymentDate: ''
          });
        } else if (!data.success) {
          console.warn('[loadAndVerifyLicense] Desktop verification explicitly rejected:', data.message);
          if (data.code === 'ERR_MAX_DEVICES_EXCEEDED') {
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: data.message, nextPaymentDate: ''
            });
          } else {
            // NO_PLAN, NOT_FOUND ??援щ룆 ?먯껜媛 ?녿뒗 寃쎌슦 濡쒖뺄 ?쇱씠?좎뒪 ?꾩쟾 珥덇린??            if (typeof api !== 'undefined' && api.saveLicenseFull) {
              await api.saveLicenseFull({});
            }
            localStorage.removeItem('onrivi_license_key');
            localStorage.removeItem('onrivi_payment_no');
            localStorage.removeItem('onrivi_verify_key');
            localStorage.removeItem('onrivi_user_id');
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: '', licenseKey: '', paymentNo: '',
              planName: '?쒗븳?ъ슜??, nextPaymentDate: ''
            });
          }
        } else {
          const expiryMs = data.next_payment_date ? parseDateStringToMs(data.next_payment_date) : 0;
          const isExpired = expiryMs === 0 ? true : (Date.now() > expiryMs);
          const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));

          if (isExpired) {
            setLicenseStatus({
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: '湲곌컙 留뚮즺 (?쒗븳 ?ъ슜??', nextPaymentDate: ''
            });

            if (typeof api.saveLicenseFull === 'function') {
              await api.saveLicenseFull({
                userId: savedUserId,
                lastRunTime: Date.now(),
                nextPaymentDate: data.next_payment_date || '',
                licenseKey: '',
                planName: '湲곌컙 留뚮즺 (?쒗븳 ?ъ슜??'
              });
            }
            
            localStorage.setItem('onrivi_license_key', '');
            localStorage.setItem('onrivi_last_run_time', Date.now().toString());
            saveSecureData('onrivi_license_status', {
              isActivated: false, isExpired: true, remainingDays: 0,
              userId: savedUserId, licenseKey: '', paymentNo: '',
              planName: '湲곌컙 留뚮즺 (?쒗븳 ?ъ슜??', nextPaymentDate: data.next_payment_date || '',
              lastVerifiedAt: Date.now()
            });
          } else {
            const newStatus = {
              isActivated: true, isExpired: false, remainingDays,
              userId: savedUserId, licenseKey: data.license_key || '', paymentNo: data.payment_no || '',
              planName: data.plan_name || '?꾨━誘몄뾼 ?붽툑??,
              nextPaymentDate: data.next_payment_date || data.trial_end_at || ''
            };

            setLicenseStatus(newStatus);

            // ?몄쬆 ?깃났 ??理쒖떊 ?쇱씠?좎뒪 ?뺣낫濡?濡쒖뺄 ?ㅽ봽?쇱씤 ?좏겙 媛깆떊
            if (typeof api.saveLicenseFull === 'function') {
              await api.saveLicenseFull({
                userId: savedUserId,
                lastRunTime: Date.now(),
                nextPaymentDate: newStatus.nextPaymentDate,
                licenseKey: newStatus.licenseKey,
                planName: newStatus.planName
              });
            }
            
            // ?곗뒪?ы깙 ?섍꼍?먯꽌??濡쒖뺄?ㅽ넗由ъ?瑜?理쒖떊 DB ?뺣낫濡??꾨꼍?섍쾶 ?숆린??(?ㅽ봽?쇱씤 ?대갚 ?⑸룄)
            localStorage.setItem('onrivi_license_key', newStatus.licenseKey);
            localStorage.setItem('onrivi_payment_no', newStatus.paymentNo);
            localStorage.setItem('onrivi_user_id', newStatus.userId);
            localStorage.setItem('onrivi_last_run_time', Date.now().toString());
            
            saveSecureData('onrivi_license_status', {
              ...newStatus,
              lastVerifiedAt: Date.now()
            });
          }
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] Desktop DB error (Network offline):', err);

        // ?슚 ?ㅽ봽?쇱씤 ?좎삁湲곌컙(Grace Period) 寃利??슚
        if (savedNextPaymentDate) {
          const expiryMs = parseDateStringToMs(savedNextPaymentDate);
          const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));

          if (remainingDays > 0) {
            console.log('[loadAndVerifyLicense] Offline grace period active. Days remaining:', remainingDays);
            showToast(`?ㅽ듃?뚰겕 ?ㅽ봽?쇱씤 紐⑤뱶濡??ㅽ뻾 以묒엯?덈떎. (援щ룆 留뚮즺源뚯? D-${remainingDays})`, "warning");
            setLicenseStatus({
              isActivated: true, isExpired: false, remainingDays,
              userId: savedUserId, licenseKey: savedLicenseKey, paymentNo: '',
              planName: savedPlanName || '?ㅽ봽?쇱씤 ?꾨━誘몄뾼 ?붽툑??,
              nextPaymentDate: savedNextPaymentDate
            });
            return;
          }
        }

        setLicenseStatus({
          isActivated: false, isExpired: true, remainingDays: 0,
          userId: savedUserId, licenseKey: '', paymentNo: '',
          planName: '?쒗븳?ъ슜??, nextPaymentDate: ''
        });
      }
      return; // ?곗뒪?ы깙? ?ш린??寃利??꾩쟾 醫낅즺!
    }

    // ============================================
    // ?? ??SaaS ?꾩슜 湲곗〈 濡쒖쭅 ??
    // ============================================
    if (!savedPaymentNo) {
      savedKey = '';
      savedUserId = '';
      savedPaymentNo = '';
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: userSub } = await supabase
            .from('subscriptions')
            .select('id, plan_name, plan_status, current_period_end, max_devices, license_key, payment_no')
            .eq('user_id', session.user.id)
            .eq('plan_status', 'ACTIVE')
            .neq('plan_name', 'ELITEPRO')
            .not('plan_name', 'ilike', '%DESKTOP%')
            .order('current_period_end', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (userSub?.payment_no) {
            savedPaymentNo = userSub.payment_no;
            savedKey = userSub.license_key || '';
            savedUserId = session.user.id;
          }
        }
      } catch (e) {
        console.warn('[loadAndVerifyLicense] user_id fallback failed:', e);
      }
    }

    // chromeStorage.set 濡쒖쭅 ?꾩쟾 ?쒓굅 (?쒖닔 localStorage留??좎?)
    localStorage.setItem('onrivi_license_key', savedKey);
    localStorage.setItem('onrivi_user_id', savedUserId);
    localStorage.setItem('onrivi_payment_no', savedPaymentNo);
    localStorage.setItem('onrivi_last_run_time', nowTime.toString());

    if (!savedKey) savedKey = '';
    setLicenseKey(savedKey);

    if (savedPaymentNo) {
      // ?썳截????꾩슜: savedPaymentNo媛 localStorage???⑥븘?덉뼱??Supabase ?몄뀡???좏슚?쒖? ?ㅼ떆 ?뺤씤 (?곗뒪?ы깙? ?쇱씠?좎뒪 湲곕컲, Supabase 遺덊븘??
      const isDesktop = typeof window !== 'undefined' && !!(window as any).electronAPI;
      if (!isDesktop) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
            Object.keys(localStorage).filter(k => k.startsWith('onrivi_')).forEach(k => localStorage.removeItem(k));
            window.location.href = '/login';
            return;
          }
        } catch (_) {
          Object.keys(localStorage).filter(k => k.startsWith('onrivi_')).forEach(k => localStorage.removeItem(k));
          window.location.href = '/login';
          return;
        }
      }
      try {
        let sessionId = localStorage.getItem('onrivi_session_id') || localStorage.getItem('onrivi_device_id');
        if (!sessionId) {
          sessionId = (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function')
            ? crypto.randomUUID()
            : 'session-' + Date.now() + '-' + Math.random().toString(36).substring(2, 15);
          localStorage.setItem('onrivi_session_id', sessionId);
        }

        const { data: license } = await supabase
          .from('subscriptions')
          .select('id, is_active, license_key, payment_no, plan_name, plan_status, current_period_end, created_at, max_devices')
          .eq('payment_no', savedPaymentNo)
          .maybeSingle();

          if (!license) {
            console.warn('[loadAndVerifyLicense] web: license not found for payment_no. Auto-clearing cache...');
            localStorage.removeItem('onrivi_payment_no');
            localStorage.removeItem('onrivi_license_key');
            localStorage.removeItem('onrivi_session_id');
            return;
          } else {
            let sub = license;
            let currentLicenseId = sub.id;
            let currentPaymentNo = savedPaymentNo;

            let expiryMs = 0;
            if (sub) {
              if (sub.plan_name && (sub.plan_name.toUpperCase() === 'DESKTOP_ONLY' || sub.plan_name.toUpperCase().includes('DESKTOP'))) {
                console.warn('[loadAndVerifyLicense] Desktop plan cannot be used in Web SaaS.');
                setLicenseStatus({
                  isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
                  licenseKey: '', paymentNo: savedPaymentNo || license?.payment_no || '',
                  planName: '?곗뒪?ы깙 ?꾩슜 ?뚮옖 (???ъ슜 遺덇?)', nextPaymentDate: ''
                });
                return;
              }
              const targetDate = sub.current_period_end;
              if (targetDate) expiryMs = parseDateStringToMs(targetDate);
              else expiryMs = Number.MAX_SAFE_INTEGER;
              
              if (sub.plan_status === 'FREE' && sub.created_at) {
                if (expiryMs === 0 || expiryMs === Number.MAX_SAFE_INTEGER) {
                  expiryMs = new Date(sub.created_at).getTime() + 7 * 24 * 60 * 60 * 1000;
                }
              }
            }

            let isExpired = expiryMs === 0 ? true : (Date.now() > expiryMs);

            // ?슚 @PATCH : 留뚮즺??寃쎌슦 API瑜??몄텧?섏뿬 ?곹깭瑜?EXPIRED濡?蹂寃쏀븯怨??덈줈??READER 諛쒓툒
            if (isExpired && sub.plan_status !== 'EXPIRED') {
              try {
                const expireRes = await fetch(getApiUrl('/api/subscription/expire'), {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ p_subscription_id: sub.id, p_user_id: savedUserId })
                });
                const expireData = await expireRes.json();
                if (expireData.success && expireData.new_subscription_id) {
                  currentLicenseId = expireData.new_subscription_id;
                  if (expireData.new_payment_no) {
                    currentPaymentNo = expireData.new_payment_no;
                    localStorage.setItem('onrivi_payment_no', currentPaymentNo);
                    savedPaymentNo = currentPaymentNo;
                  }
                  sub.plan_name = 'READER';
                  sub.plan_status = 'ACTIVE';
                  isExpired = false; // ?덈줈??READER 援щ룆???쒖꽦?붾릺?덉쑝誘濡?留뚮즺 ?꾨떂 (?섏?留?READER ?뚮옖?대?濡?insert???쒗븳??
                }
              } catch (err) {
                console.error('[LICENSE] Failed to execute expire API:', err);
              }
            }

            const remainingDays = expiryMs === 0 ? 0 : Math.max(0, Math.ceil((expiryMs - Date.now()) / (24 * 60 * 60 * 1000)));
            const isFreeTrial = sub?.plan_name === 'FREE' || currentPaymentNo.startsWith('FREE_TRIAL_');
            let planName = isFreeTrial ? '臾대즺 泥댄뿕???뚮옖' : (sub?.plan_name === 'READER' ? '湲곌컙 留뚮즺 (?쒗븳 ?ъ슜??' : `${sub?.plan_name || 'PRO'} ?꾨━誘몄뾼 ?뚮옖`);

            let activationFailed = false;
            let activationError = '';

            console.log('[loadAndVerifyLicense] insert: user=', savedUserId, 'session=', sessionId, 'licenseId=', currentLicenseId, 'isREADER=', sub?.plan_name === 'READER');
            const actRes = await fetch(getApiUrl('/api/rpc/license/insert'), {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ p_license_id: currentLicenseId, p_device_uuid: sessionId, p_device_name: 'Web SaaS', p_user_id: savedUserId, p_is_expired: sub?.plan_name === 'READER' })
            });
            const actResult = actRes.ok ? await actRes.json() : null;
            const actErr = !actRes.ok ? new Error('?쒕쾭 ?ㅻ쪟') : null;
            
            if (actErr || (actResult && !actResult.success)) {
              activationFailed = true;
              activationError = (actResult?.code === 'ERR_MAX_DEVICES_EXCEEDED' || actResult?.code === 'EXCEED_MAX_DEVICES')
                ? `?숈떆 ?묒냽 珥덇낵 (${actResult?.max_devices || '?'}?) - ?쒗븳 ?ъ슜?? 
                : `?쇱씠?좎뒪 ?ㅻ쪟: ${actResult?.message || actErr?.message || '?????녿뒗 ?ㅻ쪟'}`;
            }

            const isRestricted = activationFailed || sub?.plan_name === 'READER';

            if (activationFailed) {
              isExpired = true;
              planName = activationError;
            }

            const isActivated = !isExpired && !isRestricted;

            console.log('[LICENSE] VERIFIED setLicenseStatus isActivated=%o isExpired=%o isRestricted=%o planName=%o', isActivated, isExpired, isRestricted, planName);
            setLicenseStatus({
              isActivated, isExpired, remainingDays, userId: savedUserId,
              isRestricted, // ?뮕 ?쒗븳 ?곹깭 紐낆떆??諛섏쁺
              licenseKey: isActivated ? savedKey : '', paymentNo: currentPaymentNo || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : '')
            });

            saveSecureData('onrivi_license_status', {
              isActivated, isExpired, remainingDays, userId: savedUserId,
              isRestricted, // ?뮕 濡쒖뺄 蹂댁븞 罹먯떆?먮룄 ?쒗븳 ?곹깭 諛遊?              licenseKey: isActivated ? savedKey : '', paymentNo: currentPaymentNo || '',
              planName, nextPaymentDate: sub?.current_period_end || sub?.trial_end_at || (expiryMs > 0 ? new Date(expiryMs).toISOString() : ''),
              lastVerifiedAt: Date.now()
            });
            return;
        }
      } catch (err) {
        console.warn('[loadAndVerifyLicense] web unexpected error:', err);
      }
    }

    // ??踰꾩쟾?먯꽌??3??罹먯떆瑜??ъ슜?섏? ?딄퀬 留ㅻ쾲 DB/?쒕쾭瑜??듯빐 ?몄쬆??吏꾪뻾?섎룄濡??섏젙 (?붿껌 ?ы빆 諛섏쁺)
    const cached = loadSecureData<any>('onrivi_license_status');

    const finalPlanName = cached?.planName || (savedPaymentNo ? '?꾨━誘몄뾼 ?붽툑?? : '誘몄씤利??쇱씠?좎뒪');
    console.log('[LICENSE] FINAL setLicenseStatus isExpired=true planName=%o', finalPlanName);
    setLicenseStatus({
      isActivated: false, isExpired: true, remainingDays: 0, userId: savedUserId,
      licenseKey: savedKey || cached?.licenseKey || '', paymentNo: savedPaymentNo,
      planName: finalPlanName,
      nextPaymentDate: cached?.nextPaymentDate || (savedPaymentNo ? '-' : undefined)
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId]);


  useEffect(() => {
    if (!deviceId) {
      console.log('[WELCOME-TRIGGER] skipped: deviceId empty');
      return;
    }
    console.log('[WELCOME-TRIGGER] calling loadAndVerifyLicense deviceId=%o', deviceId);
    loadAndVerifyLicense().finally(() => {
      console.log('[WELCOME-TRIGGER] loadAndVerifyLicense done, setting isLicenseChecking=false');
      setIsLicenseChecking(false);
    });
  }, [loadAndVerifyLicense, deviceId, setIsLicenseChecking]);

  // ?뮲 [Heartbeat 媛?? 20珥덈쭏???쇱씠?좎뒪 ?몄뀡???쒕룞 ?쒓컖(last_active_at)??媛깆떊?섍퀬 媛뺥깉 ?щ?瑜?寃??  useEffect(() => {
    if (typeof window === 'undefined' || !deviceId || isLicenseChecking) return;

    const intervalId = setInterval(async () => {
      const paymentNo = localStorage.getItem('onrivi_payment_no');
      if (!paymentNo) return;

      try {
        // p_device_uuid??濡쒖뺄??sessionId瑜??섍꺼???꾩옱 釉뚮씪?곗? ???몄뀡??異붿쟻??        const currentSessionId = localStorage.getItem('onrivi_session_id') || deviceId;
        const chkRes = await fetch(getApiUrl('/api/license/check-session'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ p_payment_no: paymentNo, p_device_uuid: currentSessionId })
        });
        const chk = chkRes.ok ? await chkRes.json() : null;

        if (chk) {
          if (chk.success && chk.has_session === false && chk.is_restricted === false) {
            // ?몄뀡 ?먯껜媛 DB?먯꽌 ?꾩쟾????젣(DELETE)??寃쎌슦 (??쒕낫??湲곌린 ?댁젣 ?? -> 臾댁“嫄?媛뺤젣 濡쒓렇?꾩썐
            setLicenseStatus(prev => {
              showToast("?썞 ?숈떆?묒냽 愿由ъ뿉 ?섑빐 ?꾩옱 湲곌린???몄뀡??媛뺤젣 ?댁젣?섏뿀?듬땲?? 蹂댄샇瑜??꾪빐 濡쒓렇?꾩썐?⑸땲??", "error");
              setTimeout(async () => {
                const pNo = localStorage.getItem('onrivi_payment_no');
                const sId = localStorage.getItem('onrivi_session_id') || deviceId;
                if (pNo && sId) {
                  await fetch(getApiUrl('/api/device/deactivate'), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ p_payment_no: pNo, p_device_uuid: sId }) });
                }
                localStorage.removeItem('onrivi_session_id');
                Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
                await supabase.auth.signOut({ scope: 'local' });
                window.location.href = '/login';
              }, 3000);
              return { ...prev, isActivated: false, isExpired: true, planName: '?몄뀡 ?댁젣 (濡쒓렇?꾩썐 以?..)' };
            });
          } else if (chk.success && chk.has_session === false && chk.is_restricted !== false) {
            // ?몄뀡? 議댁옱?섏?留??쒖꽦?붾릺吏 ?딆? ?쒗븳 ?ъ슜???곹깭??寃쎌슦 -> ?쒗븳 紐⑤뱶 ?좎?
            setLicenseStatus(prev => {
              if (!prev.isExpired) {
                showToast("?좑툘 ?숈떆 ?묒냽 ?쒕룄瑜?珥덇낵?섏뿬 蹂??몄뀡? ?쒗븳 紐⑤뱶(?쎄린 ?꾩슜)濡??숈옉?⑸땲??", "warning");
              }
              return {
                ...prev,
                isActivated: false,
                isExpired: true,
                isRestricted: true
              };
            });
          } else {
            // ?뺤긽 蹂듦뎄/?좎???寃쎌슦 ?곹깭 ?숆린??            setLicenseStatus(prev => {
              if (prev.isExpired) {
                // ?슚 @PATCH : ?대? ?좎쭨 留뚮즺濡??먮떒?섏뼱 EXPIRED 泥섎━??寃쎌슦 媛뺤젣濡?蹂듦뎄?쒗궎吏 ?딅룄濡?諛⑹뼱 濡쒖쭅 異붽?
                let isActuallyExpired = false;
                if (prev.nextPaymentDate) {
                  const expMs = parseDateStringToMs(prev.nextPaymentDate);
                  if (expMs > 0 && Date.now() > expMs) isActuallyExpired = true;
                } else if (prev.remainingDays === 0 && !prev.planName.includes('罹먯떆')) {
                  isActuallyExpired = true;
                }

                if (isActuallyExpired) {
                  return prev; // ?좎쭨 留뚮즺濡??먮챸?섏뿀?쇰㈃ ?댁젣 遺덇?
                }

                return {
                  ...prev,
                  isActivated: true,
                  isExpired: false,
                  planName: chk.plan_name || prev.planName || '?꾨━誘몄뾼 ?붽툑??
                };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('[Heartbeat] session verify failed:', err);
      }
    }, 20000); // 20珥덈쭏??二쇨린??寃???섑뻾 (60珥?DB 留뚮즺 ?鍮?異⑸텇???좊ː???뺣낫)

    return () => clearInterval(intervalId);
  }, [deviceId, isLicenseChecking, setLicenseStatus, showToast]);

  // ?뱤 [OMD-CITATION-MainEditorApp] .bib ?뚰겕?ㅽ럹?댁뒪 ?먮룞 濡쒕뱶
  // ?렞 @KICK  : ?뚰겕?ㅽ럹?댁뒪 ?꾩껜瑜??ш? ?먯깋?섏뿬 .bib ?뚯씪??紐⑤몢 蹂묓빀 濡쒕뱶
  // ?슚 @PATCH : **2026-07-07** ??allMdFiles ?섏〈???꾩쟾 ?쒓굅.
  //              Electron IPC(listDirectory) 吏곸젒 ?ш? ?ㅼ틪 + fileList ?몃━ 蹂묐젺 ?먯깋.
  //              ???섍꼍: bib.handle ??VFS ??getApiUrl REST API ?쒖꽌濡??대갚 泥섎━.
  // ?뵕 @CALLS : electronAPI.listDirectory, electronAPI.readFromPath, vfsReadFile, getApiUrl
  useEffect(() => {
    if (!rootFolder?.name && !currentFileNode?.path) return;

    const tryLoadBib = async () => {
      const api = (window as any).electronAPI;
      const bibPaths: { path: string; handle?: any }[] = [];
      const seen = new Set<string>();

      const addBib = (p: string, handle?: any) => {
        const key = p.toLowerCase().replace(/\\/g, '/');
        if (!seen.has(key)) { seen.add(key); bibPaths.push({ path: p, handle }); }
      };

      // ??Electron: listDirectory IPC濡??뚰겕?ㅽ럹?댁뒪 ?꾩껜 ?ш? ?먯깋
      if (api?.listDirectory && api?.readFromPath && rootFolder?.name) {
        const scanDir = async (dirPath: string) => {
          try {
            const entries: any[] = await api.listDirectory(dirPath);
            for (const entry of entries) {
              if (entry.kind === 'file' && entry.name.toLowerCase().endsWith('.bib') && entry.path) {
                addBib(entry.path);
              } else if (entry.kind === 'directory' && entry.path) {
                await scanDir(entry.path);
              }
            }
          } catch { }
        };
        if (rootFolder?.name) await scanDir(rootFolder.name);
        if (resourceFolder) {
          // 由ъ냼???대뜑??寃쎌슦 ?꾩껜媛 ?꾨땶 bible ?대뜑留??쒖젙?섏뿬 ?ㅼ틪
          await scanDir(`${resourceFolder}\\bible`);
        }
      }

      // ??fileList ?몃━(1?④퀎 + ?댁쁺 以묒씤 children) ?ш? ?먯깋
      const scanTree = (nodes: any[]) => {
        nodes.forEach(n => {
          if (n.kind === 'file' && n.name.toLowerCase().endsWith('.bib') && n.path) {
            addBib(n.path, n.handle);
          } else if (n.kind === 'directory' && n.children) {
            scanTree(n.children);
          }
        });
      };
      scanTree(fileList);

      // + Browser FileSystem Access API (由ъ냼???대뜑 ?먯깋 - bible ?쒖젙)
      if (resourceFolderHandle && !api?.listDirectory) {
         const scanHandle = async (handle: any) => {
           try {
             for await (const [name, childHandle] of handle.entries()) {
               if (childHandle.kind === 'file' && name.toLowerCase().endsWith('.bib')) {
                 addBib(name, childHandle);
               } else if (childHandle.kind === 'directory') {
                 await scanHandle(childHandle);
               }
             }
           } catch (e) {}
         };
         try {
           const bibleHandle = await resourceFolderHandle.getDirectoryHandle('bible');
           await scanHandle(bibleHandle);
         } catch (e) {
           // bible ?대뜑媛 ?놁쑝硫?臾댁떆
         }
      }

      if (bibPaths.length === 0) { setBibContent(''); return; }

      // ??諛쒓껄??紐⑤뱺 .bib ?뚯씪 ?쎄퀬 ?⑹튂湲?      let mergedBibContent = '';
      for (const bib of bibPaths) {
        try {
          if (bib.handle) {
            // Browser FileSystem Access API (?ㅼ젣 ?대뜑 ?좏깮)
            const file = await bib.handle.getFile();
            const text = await file.text();
            if (text) mergedBibContent += '\n' + text;
          } else if (api?.readFromPath) {
            // Electron: 諛깆뒳?섏떆 寃쎈줈濡??꾨떖
            const nativePath = bib.path.replace(/\//g, '\\');
            const file = await api.readFromPath(nativePath);
            if (file?.content) mergedBibContent += '\n' + file.content;
          } else {
            // ???섍꼍: VFS 癒쇱? ?쒕룄 ??REST API ?대갚
            const { vfsReadFile: vfsRead } = await import('@/lib/virtualFileSystem');
            const vfsContent = vfsRead(bib.path);
            if (vfsContent) {
              mergedBibContent += '\n' + vfsContent;
            } else {
              try {
                const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(bib.path)}`));
                if (res.ok) { const d = await res.json(); if (d?.content) mergedBibContent += '\n' + d.content; }
              } catch { }
            }
          }
        } catch { }
      }
      setBibContent(mergedBibContent.trim());
    };
    tryLoadBib();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentFileNode?.path, rootFolder?.name, fileList, workspaceType, resourceFolder, resourceFolderHandle]);

  // ?뱤 [OMD-LICENSE-MainEditorApp-POLLING]
  // ?슚 @PATCH: 2026-07-05 - ?ъ슜??吏?쒖뿉 ?곕씪 臾닿굅??諛깃렇?쇱슫???ㅼ떆媛?媛먯떆(Polling) 諛?媛뺤젣 濡쒓렇?꾩썐 李⑤떒 濡쒖쭅 ?꾨㈃ ?쒓굅.
  // ?ㅼ쭅 珥덇린 吏꾩엯 ??loadAndVerifyLicense)?먮쭔 沅뚰븳??1???먮퀎?섏뿬 ?곗뺨 ?섏씠吏 ?쒖뼱濡??泥댄빀?덈떎.

  // G. 留뚮즺???먯젙(24:00) 李⑤떒 諛깃렇?쇱슫????대㉧ (?좎삁 ?놁씠 利됱떆 李⑤떒)
  useEffect(() => {
    if (!licenseStatus.nextPaymentDate || licenseStatus.isActivated) return;

    const expiryDate = new Date(licenseStatus.nextPaymentDate);
    expiryDate.setHours(24, 0, 0, 0); // 留뚮즺???먯젙
    const expiryTime = expiryDate.getTime();

    const checkExpiry = () => {
      const now = Date.now();
      if (now >= expiryTime && !licenseStatus.isExpired) {
        showToast("?뵏 ?쇱씠?좎뒪媛 留뚮즺?섏뿀?듬땲?? ?먮뵒?곌? 誘몃━蹂닿린 ?꾩슜 紐⑤뱶濡??좉퉩?덈떎.", "error");
        setPreviewModeRaw('preview');
        setLicenseStatus(prev => ({ ...prev, isExpired: true }));
      }
    };

    const intervalId = setInterval(checkExpiry, 60 * 60 * 1000); // 1?쒓컙 二쇨린 寃??    checkExpiry();

    return () => clearInterval(intervalId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [licenseStatus.nextPaymentDate, licenseStatus.isActivated, licenseStatus.isExpired, showToast]);

  // ====================================================================
  // ?뱤 [OMD-LICENSE-MainEditorApp-0090] MainEditorApp.tsx ??license_force_preview
  // ?렞 @KICK  : 誘몄씤利??먮뒗 怨꾩빟留뚮즺 ???먮뵒??紐⑤뱶瑜?臾댁“嫄?誘몃━蹂닿린 ?꾩슜?쇰줈 媛뺤젣
  // ?썳截?@GUARD : mounted ?댄썑?먮쭔 ?ㅽ뻾; 遺덊븘?뷀븳 ?ъ꽕??諛⑹?瑜??꾪빐 ?꾩옱 紐⑤뱶? 紐⑺몴 紐⑤뱶 鍮꾧탳;
  //             css-style 紐⑤뱶???덉슜 (?쒖떇 ?ㅼ젙 以묒뿉??媛뺤젣 ?꾪솚?섏? ?딆쓬) ??誘몄씤利???preview留??덉슜
  //             ?좏슚 ?쇱씠?좎뒪 ?쒖뿉??紐⑤뱶 ?먯쑀濡?쾶 ?꾪솚 媛??(preview 怨좎젙 ?댁젣)
  // ?슚 @PATCH : 2026-06-21 ???좉퇋: 誘몄씤利?怨꾩빟留뚮즺 ??preview 媛뺤젣; previewMode deps 異붽?
  //             2026-06-22 ??`else if` (?좏슚 ??both 蹂듭썝) ?쒓굅 ???좏슚 ?쇱씠?좎뒪??誘몃━蹂닿린 ?꾪솚 媛??  // ?뵕 @CALLS : setPreviewModeRaw
  // ====================================================================
  useEffect(() => {
    if (!mounted || isLicenseChecking) return;

    if (licenseStatus.isExpired) {
      // ?뵏 ?쒗븳 ?ъ슜??(留뚮즺/誘몄씤利?: ?먮뵒??紐⑤뱶瑜?誘몃━蹂닿린 ?꾩슜?쇰줈 媛뺤젣
      // (珥덇린 ?곗뺨 ?섏씠吏 ?몄텧? ?섎떒???듯빀 ?쇱슦??媛?쒖뿉???대떦?⑸땲??
      if (previewModeRef.current !== 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }
    }
  }, [licenseStatus.isExpired, mounted, isLicenseChecking]);

  // ====================================================================
  // ?뱤 [OMD-PAY-MainEditorApp-0017] MainEditorApp.tsx ??supabaseRealtime_license
  // ?렞 @KICK  : ?ㅼ떆媛??쒖꽦?붾? ?꾪빐 license_activations??Supabase postgres_changes 援щ룆, ?곗뒪?ы넲 ?꾨줈?좎퐳 ?대갚 ?ы븿
  // ?썳截?@GUARD : ?몃쭏?댄듃 ??梨꾨꼸 諛?由ъ뒪???뺣━; device_uuid ?꾪꽣濡?以묐났 ?쒓굅
  // ?슚 @PATCH : **2026-07-22** ??Realtime 援щ룆 ?뚯씠釉붾챸 license_activations?뭠icense_activations ?꾪솚; Electron ?섍꼍???꾪븳 ?곗뒪?ы넲 onLicenseActivated 諛깆뾽 諛?寃곗젣踰덊샇(paymentNo) ?꾨떖 蹂댁셿
  // ?뵕 @CALLS : supabase.channel, supabase.from.license_activations.select, handleSuccessActivation, showToast
  // ====================================================================
  useEffect(() => {
    if (!deviceId) return;

    const api = (window as any).electronAPI;
    const isDesktop = !!api;

    // ?곗뒪?ы깙: Electron IPC 由ъ뒪?덈쭔 ?ъ슜 (Supabase WebSocket 遺덊븘??
    let removeListener: any = null;
    if (isDesktop) {
      if (typeof api.onLicenseActivated === 'function') {
        removeListener = api.onLicenseActivated(async (updatedData: any) => {
          await handleSuccessActivation(updatedData.verifyKey, updatedData.userId, updatedData.paymentNo || '', updatedData.licenseKey || '');
          showToast("?럦 ?뺥뭹 ?쇱씠?좎뒪 ?곕룞 ?깃났! 源⑤걮???섍꼍???꾪빐 ?먮뵒?곕? ?ㅼ떆 ?쒖옉?⑸땲??..", "success");
          setTimeout(() => { window.location.reload(); }, 2000);
        });
      }
      return () => {
        if (typeof removeListener === 'function') removeListener();
      };
    }

    // ???꾩슜: Supabase Realtime 援щ룆
    const channel = supabase
      .channel(`device-activation-${deviceId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'license_activations',
          filter: `device_uuid=eq.${deviceId}`
        },
        async (payload: any) => {
          // ?슚 @PATCH : ??쒕낫??湲곌린 愿由??먯꽌 ?몄뀡??媛뺤젣 ?댁젣(DELETE)??寃쎌슦, ?섑듃鍮꾪듃瑜?湲곕떎由ъ? ?딄퀬 利됱떆 媛뺤젣 濡쒓렇?꾩썐
          if (payload.eventType === 'DELETE') {
            showToast("?썞 ?숈떆?묒냽 愿由ъ뿉 ?섑빐 ?꾩옱 湲곌린???몄뀡??媛뺤젣 ?댁젣?섏뿀?듬땲?? 蹂댄샇瑜??꾪빐 濡쒓렇?꾩썐?⑸땲??", "error");
            setTimeout(async () => {
              localStorage.removeItem('onrivi_session_id');
              Object.keys(localStorage).filter(k => k.startsWith('sb-')).forEach(k => localStorage.removeItem(k));
              await supabase.auth.signOut({ scope: 'local' });
              window.location.href = '/login';
            }, 3000);
            return;
          }

          const newRecord = payload.new;
          if (newRecord && newRecord.subscription_id) {
            const { data, error } = await supabase
              .from('subscriptions')
              .select(`
                verify_key,
                license_key,
                user_id
              `)
              .eq('id', newRecord.subscription_id)
              .single();

            if (!error && data && data.verify_key) {
              const userEmail = licenseStatus.userId || 'user@onrivi.com';
              handleSuccessActivation(data.verify_key, userEmail, data.id || '', data.license_key || '');
              showToast("?럦 ?뺥뭹 ?쇱씠?좎뒪媛 寃곗젣 利됱떆 ?덉쟾?섍쾶 ?뱀씤?섏뿀?듬땲??", "success");
            }

          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, _licenseKey_init, licenseStatus.userId]);

  // ====================================================================
  // ?뱤 [OMD-AUTH-MainEditorApp-0018] MainEditorApp.tsx ??handleSuccessActivation
  // ?렞 @KICK  : ?깃났?곸씤 寃곗젣/?쒖꽦????紐⑤뱺 ??μ냼 怨꾩링???뺤씤???쇱씠?좎뒪 ?쒖꽦???좎?
  // ?썳截?@GUARD : ?먯옄??setLicenseStatus + ?뚮옯????μ냼 ???(electronAPI, chrome.storage, localStorage) 諛??ㅼ떆媛??숆린??  // ?슚 @PATCH : 2026-06-28 ??chrome.storage.local.set ?쒓굅 (濡쒖뺄?ㅽ넗由ъ? 寃⑸━)
  //              寃곗젣踰덊샇(paymentNo) ?몄옄 ?섏슜 諛?loadAndVerifyLicense() ?몄텧???듯븳 ?곹깭 ?ㅼ떆媛??숆린??  // ?뵕 @CALLS : setLicenseStatus, api.saveLicenseFull, localStorage.setItem, loadAndVerifyLicense
  // ====================================================================
  const handleSuccessActivation = async (verifyKey: string, userId: string, paymentNo: string, explicitLicenseKey?: string) => {
    const api = (window as any).electronAPI;
    const finalLicenseKey = explicitLicenseKey || licenseKey;

    if (api && typeof api.saveLicenseFull === 'function') {
      await api.saveLicenseFull({
        licenseKey: finalLicenseKey,
        verifyKey: verifyKey,
        userId: userId,
        paymentNo: paymentNo
      });
    } 
    
    // ?곗뒪?ы깙(Electron) ?섍꼍?대씪 ?섎뜑?쇰룄 ?밸럭 ?대???踰붿슜?곸씤 ?쒖슜 諛??대갚???꾪빐 ??긽 濡쒖뺄?ㅽ넗由ъ?????ν빀?덈떎.
    localStorage.setItem('onrivi_license_key', finalLicenseKey);
    localStorage.setItem('onrivi_verify_key', verifyKey);
    localStorage.setItem('onrivi_user_id', userId);
    localStorage.setItem('onrivi_payment_no', paymentNo);

    await loadAndVerifyLicense();
  };

  // ?뮕 [Step 2 由ы뙥?좊쭅?쇰줈 ?대낫?닿린, ?대컮?? 而댄럩 ??湲고? 紐⑤떖 ?곹깭 ??????젣??(useEditorModals濡??닿?)]

  const [isEditorReady, setIsEditorReady] = useState(false);

  const [isMergeMode, setIsMergeMode] = useState(false);
  const [selectedMergeNodes, setSelectedMergeNodes] = useState<FileNode[]>([]);
  // ?뮕 [Step 2 由ы뙥?좊쭅?쇰줈 isMergeModalOpen ??젣??
  const [cursorLine, setCursorLine] = useState(1);
  const [cursorColumn, setCursorColumn] = useState(1);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'unsaved' | ''>('');
  const [floatingHeadingLevel, setFloatingHeadingLevel] = useState(3);

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0019] MainEditorApp.tsx ??toggleMergeNodeSelect
  // ?렞 @KICK  : 蹂묓빀 ?좏깮 紐⑸줉?먯꽌 FileNode 異붽?/?쒓굅 ?좉?
  // ?썳截?@GUARD : 以묐났 異붽? 諛⑹?瑜??꾪빐 寃쎈줈 ?먮뒗 ?대쫫?쇰줈 以묐났 ?쒓굅
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : setSelectedMergeNodes
  // ====================================================================
  const toggleMergeNodeSelect = (node: FileNode) => {
    setSelectedMergeNodes(prev => {
      const exists = prev.some(n => n.path ? n.path === node.path : n.name === node.name);
      if (exists) {
        return prev.filter(n => n.path ? n.path !== node.path : n.name !== node.name);
      } else {
        return [...prev, node];
      }
    });
  };

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0020] MainEditorApp.tsx ??handleOpenMergeModal
  // ?렞 @KICK  : 2媛??댁긽???뚯씪???좏깮??寃쎌슦?먮쭔 蹂묓빀 紐⑤떖 ?닿린
  // ?썳截?@GUARD : 紐⑤떖 ?닿린 ??理쒖냼 ?좏깮 媛쒖닔(2) 寃利?  // ?슚 @PATCH : None
  // ?뵕 @CALLS : showToast, setIsMergeModalOpen
  // ====================================================================
  const handleOpenMergeModal = () => {
    if (selectedMergeNodes.length < 2) {
      showToast("蹂묓빀?섎젮硫?理쒖냼 2媛??댁긽???뚯씪???좏깮?댁빞 ?⑸땲??", 'warning');
      return;
    }
    setIsMergeModalOpen(true);
  };





  const previewRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<any>(null);
  // ?뮕 ?ㅼ쨷 ??愿???곹깭 ?좎뼵 諛?諛깆뾽 ?덊띁?곗뒪
  const useEditorTabsResult = useEditorTabs(
    editorRef,
    setContent,
    setCurrentFileName,
    setCurrentFileNode,
    isEditorMountedRef,
    previewModeRef,
    previewDebounceRef,
    isComposingRef,
    workspaceType,
    showToast,
    getRelativePath,
    tabs,        // ?뮕 [TDZ 諛⑹뼱] 理쒖긽?⑥뿉???좎뼵???곹깭瑜?二쇱엯
    setTabs,
    activeTabId,
    setActiveTabId,
    setPreviewModeRaw
  );

  // ?뮕 [TDZ 諛⑹뼱] useEditorTabs 諛섑솚媛?以??곷떒?먯꽌 ?좎뼵?섏? ?딆? 寃껊뱾留?異붽? 異붿텧
  const updateContent = useEditorTabsResult.updateContent;
  const switchTab = useEditorTabsResult.switchTab;
  const createNewTab = useEditorTabsResult.createNewTab;

  // Ref瑜?怨듭쑀 tabsRef/activeTabIdRef???숆린??(React state 吏곸젒 ?ъ슜 ??useEffect濡??낅뜲?댄듃??useEditorTabs ref??stale?????덉쓬)
  // ?슚 @PATCH : useEditorTabsResult.ref ??React state 吏곸젒 李몄“濡?蹂寃?(stale ref媛 closeTab?먯꽌 ??젣????쓣 蹂듭썝?섎뒗 踰꾧렇 ?섏젙) | 2026-06-18
  tabsRef.current = tabs;
  activeTabIdRef.current = activeTabId;

  // ====================================================================
  // ?뱤 [OMD-EDIT-0012 TDZ-GUARD] MainEditorApp.tsx ??autoSaveRef/lastSavedContentRef ?좏뻾 ?좎뼵
  // ?렞 @KICK  : autoSaveRef??L1117 useEffect?먯꽌 癒쇱? 李몄“?섍퀬, lastSavedContentRef??  //             useFileExplorer ?몄옄濡?癒쇱? 李몄“?섎?濡????몄텧 ?댁쟾???좏뻾 ?좎뼵
  // ?썳截?@GUARD : 湲곗〈 L1289 ?꾩튂???덈뜕 ?좎뼵???ъ슜 吏???댁쟾?쇰줈 ?대룞?섏뿬 TDZ ?쒓굅
  // ?슚 @PATCH : autoSaveRef ?좎뼵 ?꾩튂瑜?L1289?묹1101濡??대룞 | 2026-06-15 | rS TDZ(autoSaveRef_sync useEffect) ?닿껐
  // ?뵕 @CALLS : useRef (React)
  // ====================================================================
  // ?뮕 [TDZ 諛⑹뼱] lastSavedContentRef??useFileExplorer?먯꽌 癒쇱? 李몄“?섎?濡??곷떒???좎뼵
  const lastSavedContentRef = useRef<string>('');
  const prevActiveTabRef = useRef<string | null>(null);

  // ?뮕 [WBS CORE-02 / ?붽뎄?ы빆 4] State Stale Closure 諛⑹?瑜??꾪븳 Ref 諛깆뾽 ?쒖뒪???꾩엯
  const currentFileNodeRef = useRef(currentFileNode);
  const currentFileParentHandleRef = useRef<any>(null);
  const currentFileNameRef = useRef(currentFileName);
  const workspaceTypeRef = useRef(workspaceType);
  const rootFolderRef = useRef(rootFolder);
  const licenseStatusRef = useRef(licenseStatus);
  const tabSizeRef = useRef(4);
  // ?슚 @PATCH : A4 議고뙋 媛???ㅼ??쇰쭅 濡쒖쭅
  useEffect(() => {
    if (!isA4GuardEnabled) {
      setPreviewZoomScale(1);
      return;
    }

    const container = previewRef.current;
    if (!container) return;

    // ResizeObserver瑜??듯빐 custom-preview-container ?덈퉬瑜?媛먯??섏뿬 A4(210mm) 鍮꾩쑉??留욊쾶 zoom 怨꾩궛
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // 釉뚮씪?곗? 湲곕낯 96 DPI 湲곗?: 210mm = 793.7px (???794px)
        const A4_PIXEL_WIDTH = 794;

        // ?щ갚(Padding) ?깆쓣 怨좊젮?섏뿬 而⑦뀒?대꼫 ?덈퉬蹂대떎 A4媛 ?щ㈃ 異뺤냼, ?꾨땲硫?1 ?좎?
        // 40px? ?묒쁿 ?ъ쑀 ?щ갚(?⑤뵫 諛??ㅽ겕濡ㅻ컮)
        if (width < A4_PIXEL_WIDTH + 40) {
          const scale = Math.max(0.3, (width - 40) / A4_PIXEL_WIDTH);
          setPreviewZoomScale(scale);
        } else {
          setPreviewZoomScale(1);
        }
      }
    });

    observer.observe(container);

    return () => {
      observer.disconnect();
    };
  }, [isA4GuardEnabled, previewRef]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0021] MainEditorApp.tsx ??currentFileNodeRef_sync
  // ?렞 @KICK  : ?몃뱾?ъ뿉???ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 currentFileNodeRef ?숆린??  // ?썳截?@GUARD : WBS CORE-02 ?ㅽ뀒???대줈? 諛⑹? ?쒖뒪?쒖쓽 ?쇰?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => { currentFileNodeRef.current = currentFileNode; }, [currentFileNode]);
  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0022] MainEditorApp.tsx ??currentFileNameRef_sync
  // ?렞 @KICK  : ?몃뱾?ъ뿉???ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 currentFileNameRef ?숆린??  // ?썳截?@GUARD : WBS CORE-02 ?ㅽ뀒???대줈? 諛⑹????쇰?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => { currentFileNameRef.current = currentFileName; }, [currentFileName]);
  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0023] MainEditorApp.tsx ??workspaceTypeRef_sync
  // ?렞 @KICK  : ?몃뱾?ъ뿉???ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 workspaceTypeRef ?숆린??  // ?썳截?@GUARD : WBS CORE-02 ?ㅽ뀒???대줈? 諛⑹????쇰?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => { workspaceTypeRef.current = workspaceType; }, [workspaceType]);
  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0024] MainEditorApp.tsx ??rootFolderRef_sync
  // ?렞 @KICK  : ?몃뱾?ъ뿉???ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 rootFolderRef ?숆린??  // ?썳截?@GUARD : WBS CORE-02 ?ㅽ뀒???대줈? 諛⑹????쇰?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => { rootFolderRef.current = rootFolder; }, [rootFolder]);
  const resourceFolderRef = useRef(resourceFolder);
  useEffect(() => { resourceFolderRef.current = resourceFolder; }, [resourceFolder]);

  const resourceFolderHandleRef = useRef(resourceFolderHandle);
  useEffect(() => { resourceFolderHandleRef.current = resourceFolderHandle; }, [resourceFolderHandle]);
  // ====================================================================
  // ?뱤 [OMD-LICENSE-MainEditorApp-0075] MainEditorApp.tsx ??licenseStatusRef_sync
  // ?렞 @KICK  : ?몃뱾?ъ뿉???ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 licenseStatusRef ?숆린??  // ?썳截?@GUARD : WBS CORE-02 ?ㅽ뀒???대줈? 諛⑹? ?쒖뒪?쒖쓽 ?쇰?
  // ?슚 @PATCH : **2026-06-21** ???좉퇋: 留뚮즺 ??Ctrl+S/?대낫?닿린 李⑤떒???꾪븳 ref 異붽?
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => { licenseStatusRef.current = licenseStatus; }, [licenseStatus]);
  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0025] MainEditorApp.tsx ??tabSizeRef_sync
  // ?렞 @KICK  : ?쒖꽦 CSS ?꾨줈??tabSize ?ㅼ젙?먯꽌 tabSizeRef ?낅뜲?댄듃
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : parseInt
  // ====================================================================
  useEffect(() => {
    // ?뮕 ?먮뵒?????덈퉬瑜??ㅽ럹?댁뒪 4移몄쑝濡?怨좎젙
    tabSizeRef.current = 4;
  }, []);

  const useFileExplorerResult = useFileExplorer({
    editorRef,
    contentRef,
    currentFileNode,
    currentFileName,
    lastSavedContentRef,
    currentFileParentHandleRef,
    tabsRef,
    isSearchOpen,
    activeTabIdRef,
    setContent,
    setCurrentFileName,
    setCurrentFileNode,
    setTabs,
    setActiveTabId,
    setSaveStatus,
    setIsSidebarOpen,
    setIsSearchOpen,
    setHelpContent,
    setHelpTitle,
    setPreviewModeRaw,
    previewModeRef,
    isEditorMountedRef,
    showToast,
    createNewTab,
    switchTab,
    rootFolder,
    setRootFolder,
    fileList,
    setFileList,
    workspaceType,
    setWorkspaceType,
    licenseStatus
  });

  // ?뮕 [TDZ 諛⑹뼱] useFileExplorer 諛섑솚媛믪뿉??利됱떆 援ъ“遺꾪빐 ?좊떦?섏뿬 李몄“ ?먮윭 諛⑹?
  const {
    refreshFileList,
    saveFile,
    handleFileClick,
    selectRootFolder,
    restoreFolderPermission,
    handleFileOpenByPath
  } = useFileExplorerResult;

  const selectResourceFolder = async () => {
    const api = (window as any).electronAPI;
    if (api && api.selectFolder) {
      const result = await api.selectFolder(resourceFolder || '');
      if (result && result.status !== 'canceled' && result.path) {
        setResourceFolder(result.path);
        try { saveSecureData('resourceFolder', result.path); } catch { }
        
        // ?뮕 ???대뜑 ?곕룞 ???대뜑 ??湲곗〈 ?쒖떇???덈떎硫?濡쒕뱶
        try {
          const loadedProfiles = await api.readProfiles(result.path);
          if (Array.isArray(loadedProfiles) && loadedProfiles.length > 0) {
            setProfiles(prev => {
              const systemPart = prev.filter(p => isSystemProfileId(p.id));
              return [...systemPart, ...loadedProfiles];
            });
            showToast('怨듯넻 ?대뜑?먯꽌 湲곗〈 ?쒖떇??遺덈윭?붿뒿?덈떎.', 'success');
          } else {
             showToast('?먯썝 愿由??대뜑媛 ?ㅼ젙?섏뿀?듬땲??', 'success');
             // 鍮??대뜑?쇰㈃ ?꾩옱 濡쒖뺄 ?쒖떇??????좊룄
             setProfiles(prev => {
               if (prev.length > SYSTEM_PROFILES.length) {
                 (window as any)._lastSavedProfilesHash = null;
                 return [...prev];
               }
               return prev;
             });
          }
        } catch (e) {
          showToast('?먯썝 愿由??대뜑媛 ?ㅼ젙?섏뿀?듬땲??', 'success');
        }
      }
    } else if (typeof (window as any).showDirectoryPicker === 'function') {
      try {
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        setResourceFolderHandle(handle);
        setResourceFolder(handle.name);
        await idb.set('resourceFolderHandle', handle);
        try { saveSecureData('resourceFolder', handle.name); } catch { }
        
        // ?뮕 ???대뜑 ?곕룞 ???대뜑 ??湲곗〈 ?쒖떇(profiles)???덈떎硫?濡쒕뱶?섏뿬 ??뼱?곌린 諛⑹?
        try {
          const profilesDir = await handle.getDirectoryHandle('profiles', { create: false });
          const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: false });
          const file = await fileHandle.getFile();
          const text = await file.text();
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setProfiles(prev => {
              const systemPart = prev.filter(p => isSystemProfileId(p.id));
              return [...systemPart, ...parsed];
            });
            showToast('怨듯넻 ?대뜑?먯꽌 湲곗〈 ?쒖떇??遺덈윭?붿뒿?덈떎.', 'success');
          } else {
             showToast('?먯썝 愿由??대뜑媛 ?ㅼ젙?섏뿀?듬땲??', 'success');
          }
          (window as any)._resourceFolderSynced = true;
        } catch (err) {
          // ?뚯씪???놁쑝硫?湲곗〈 濡쒖뺄/鍮??곹깭 ?좎?
          showToast('?먯썝 愿由??대뜑媛 ?ㅼ젙?섏뿀?듬땲??', 'success');
          (window as any)._resourceFolderSynced = true; // ?뚯씪???녿뒗 ?좉퇋 ?대뜑?쇰룄 ?숆린??沅뚰븳? ?띾뱷??          
          // 湲곗〈??濡쒖뺄 ?ㅽ넗由ъ????ㅺ퀬 ?덈뜕 ?쒖떇?ㅼ쓣 諛⑷툑 ?곕룞???대뜑??利됱떆 ??ν븯?꾨줉 ?좊룄
          setProfiles(prev => {
            if (prev.length > SYSTEM_PROFILES.length) {
               // ?댁슜臾쇱쓽 蹂寃??놁씠 李몄“留?媛깆떊?섏뿬 profilesSave effect ?몃━嫄?               (window as any)._lastSavedProfilesHash = null; // 媛뺤젣 ????좊룄
               return [...prev];
            }
            return prev;
          });
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          showToast('?대뜑 ?좏깮 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.', 'error');
        }
      }
    } else {
      showToast('??釉뚮씪?곗??먯꽌???대뜑 ?좏깮 湲곕뒫??吏?먰븯吏 ?딆뒿?덈떎.', 'warning');
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0026 ??FIXED] MainEditorApp.tsx ??setPreviewMode
  // ?렞 @KICK  : ?먮뵒??肄섑뀗痢?蹂댁〈, css-style ?곗뺨 ???먮룞 ?앹꽦 諛??꾩?留?肄섑뀗痢?媛?쒖? ?④퍡 誘몃━蹂닿린 紐⑤뱶 ?꾪솚
  // ?썳截?@GUARD : css-style ?좉툑 以?紐⑤뱶 蹂寃?諛⑹?, ?꾪솚 ???먮뵒??肄섑뀗痢?媛뺤젣 ?숆린?? helpContent ?ъ젙??李⑤떒, ?꾩?留???'?꾩?留?md') 紐⑤뱶 蹂寃?李⑤떒
  // ?슚 @PATCH : ?꾩?留????쎄린 ?꾩슜 ?좉툑 媛??異붽? (2026-06-17)
  // ?뵕 @CALLS : editorRef.current.getValue, setContent, setPreviewModeRaw, setHelpContent, createNewTab, switchTab, clearTimeout
  // ====================================================================
  const setPreviewMode = useCallback((modeOrFn: 'edit' | 'both' | 'preview' | 'css-style' | ((prev: 'edit' | 'both' | 'preview' | 'css-style') => 'edit' | 'both' | 'preview' | 'css-style')) => {
    // 紐⑤뱶 ?꾪솚 ???먮뵒???댁슜??利됱떆 React ?곹깭??諛섏쁺 (100ms ?붾컮?댁뒪 ?먯떎 諛⑹?)
    if (editorRef.current && previewModeRef.current !== 'preview') {
      if (previewDebounceRef.current) {
        clearTimeout(previewDebounceRef.current);
        previewDebounceRef.current = null;
      }
      const latestVal = editorRef.current.getValue();
      if (latestVal !== contentRef.current) {
        setContent(latestVal);
      }
    }
    setPreviewModeRaw(prev => {
      const next = typeof modeOrFn === 'function' ? modeOrFn(prev) : modeOrFn;

      if (isRestrictedUser) {
        if (next !== 'preview') {
          showToast("?뵏 ?쇱씠?좎뒪媛 留뚮즺?섏뿀嫄곕굹 ?뺥뭹 ?몄쬆?섏? ?딆븯?듬땲?? 誘몃━蹂닿린 ?꾩슜 紐⑤뱶濡??쒗븳?⑸땲??", "warning");
        }
        return 'preview';
      }
      const activeTab = tabsRef.current.find(t => t.id === activeTabIdRef.current);
      if (activeTab?.name === '?꾩?留?md' && next !== 'preview' && next !== 'css-style') return prev;

      // ?뮕 ?쇰컲 蹂닿린 紐⑤뱶(edit, both, preview)濡?蹂寃쏀븯??寃쎌슦, ?대? ?꾩뿭 ?곹깭??Ref??諛깆뾽?대몼?덈떎.
      if (next === 'edit' || next === 'both' || next === 'preview') {
        lastGeneralPreviewModeRef.current = next;
      }

      // ?뮕 ?쒖떇 ?뺤쓽(css-style) 紐⑤뱶濡??ㅼ쐞移?맆 ??-> 湲곗〈 ???앹꽦 濡쒖쭅???먭린?섍퀬, ??紐⑤떖???꾩슦?꾨줉 媛濡쒖콝?덈떎.
      if (next === 'css-style') {
        setTimeout(() => setIsStyleModalOpen(true), 0);
        return prev; // ?먮뵒??酉곗엵 紐⑤뱶???댁쟾 ?곹깭 洹몃?濡??좎?
      }

      previewModeRef.current = next;
      if (typeof window !== 'undefined' && next !== 'css-style') {
        localStorage.setItem('previewMode', next);
      }
      if (next === 'preview') {
        isEditorMountedRef.current = false;
      } else {
        isEditorMountedRef.current = true;
      }

      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContent, createNewTab, setTabs, licenseStatus, showToast]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0027 ??FIXED] MainEditorApp.tsx ??closeTab
  // ?렞 @KICK  : ??λ릺吏 ?딆? 蹂寃쎌궗???뺤씤, 紐⑤뜽 ?먭린 諛?css-style/?꾩?留?紐⑤뱶 ?먮룞 醫낅즺? ?④퍡 ???リ린
  // ?썳截?@GUARD : ?대깽??stopPropagation, ?섏젙?????뺤씤, Monaco 紐⑤뜽 ?먭린, ?ㅼ쓬 ??쑝濡??꾪솚 ?먮뒗 鍮????앹꽦
  // ?슚 @PATCH : ?꾩?留????レ쓣 ??'both' 紐⑤뱶 蹂듭썝 異붽? (2026-06-17); tabsRef 利됱떆 ?숆린??+ isDisposed() 媛?쒕줈 Model is disposed! ?щ옒??諛⑹? (2026-06-18); stale ref濡??명븳 ??젣 ??蹂듭썝 踰꾧렇 ?섏젙 (2026-06-18)
  // ?뵕 @CALLS : setTabs, switchTab, createNewTab, setConfirmConfig, tab.model.dispose
  // ====================================================================
  const closeTab = useCallback((tabId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }

    const tabToClose = tabsRef.current.find(t => t.id === tabId);
    if (!tabToClose) return;

    const performClose = () => {
      if (tabToClose.model) {
        tabToClose.model.dispose();
      }

      // ?뮕 ?곗뺨?섏씠吏 ?꾩슜 'Onrivi Author ?쒖옉?섍린.md' ??쓣 ?リ굅???꾩?留먯쓣 ?レ쓣 ?뚯쓽 紐⑤뱶 議곗젙
      if (tabToClose.name === 'Onrivi Author ?쒖옉?섍린.md' || tabToClose.name === '?꾩?留?md') {
        const targetMode = isRestrictedUser ? 'preview' : (previewModeRef.current === 'css-style' ? 'both' : previewModeRef.current);
        setPreviewModeRaw(targetMode);
        previewModeRef.current = targetMode;
        isEditorMountedRef.current = targetMode !== 'preview';
      }

      const nextTabs = tabsRef.current.filter(t => t.id !== tabId);
      const closeIndex = tabsRef.current.findIndex(t => t.id === tabId);
      tabsRef.current = nextTabs;
      setTabs(nextTabs);

      if (activeTabIdRef.current === tabId) {
        if (nextTabs.length > 0) {
          const nextActiveIndex = Math.max(0, closeIndex - 1);
          const nextActiveTab = nextTabs[nextActiveIndex] || nextTabs[0];
          switchTab(nextActiveTab.id);
        } else {
          setContent('');
          setCurrentFileName('???뚯씪.md');
          setCurrentFileNode(null);
          setActiveTabId(null);
          if (editorRef.current) {
            editorRef.current.setValue('');
          }
        }
      }
    };

    if (tabToClose.isModified) {
      setConfirmConfig({
        isOpen: true,
        title: "??λ릺吏 ?딆? 蹂寃쎌궗??,
        message: `'${tabToClose.name}' ?뚯씪??蹂寃쎌궗??씠 ??λ릺吏 ?딆븯?듬땲?? ??ν븯吏 ?딄퀬 ?レ쑝?쒓쿋?듬땲源?`,
        confirmText: "??ν븯吏 ?딄퀬 ?リ린",
        cancelText: "痍⑥냼",
        isDanger: true,
        onConfirm: () => {
          performClose();
        }
      });
      return;
    }

    performClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [createNewTab, switchTab, setTabs]);

  const useEditorSettingsResult = useEditorSettings(
    editorRef,
    mounted,
    setMounted,
    previewMode,
    setPreviewMode,
    setSidebarWidth,
    setActiveProfileId,
    setWorkspaceType,
    setRootFolder,
    setIsAddonEnv,
    showToast
  );

  // ?뮕 [TDZ 諛⑹뼱] useEditorSettings 諛섑솚媛믪쓣 利됱떆 援ъ“遺꾪빐 ?좊떦?섏뿬 TDZ ?먮윭 諛⑹?
  const {
    isDarkMode,
    setIsDarkMode,
    fontSize,
    setFontSize,
    wordWrap,
    setWordWrap,
    autoSave,
    setAutoSave,
    quoteStyle,
    setQuoteStyle,
    themePalette,
    setThemePalette,
    licenseKey,
    setLicenseKey,
    customHotkeys,
    setCustomHotkeys,
    customSlashCommands,
    setCustomSlashCommands,
    customSlashCommandsRef,
    handleThemeChange,
    autoClosingBrackets,
    setAutoClosingBrackets,
    geminiApiKey,
    setGeminiApiKey,
    aiModelName,
    setAiModelName
  } = useEditorSettingsResult;

  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiAction = async (action: AiActionType) => {
    if (!geminiApiKey) {
      showToast("?섍꼍?ㅼ젙(?좏뵆由ъ??댁뀡)?먯꽌 Google Gemini API Key瑜?癒쇱? ?낅젰?댁＜?몄슂.", 'error');
      return;
    }
    const editor = editorRef.current;
    if (!editor) return;
    const model = editor.getModel();
    const selection = editor.getSelection();
    if (!model || !selection || selection.isEmpty()) {
      showToast("媛怨듯븷 ?띿뒪?몃? 癒쇱? ?쒕옒洹??좏깮) ?댁＜?몄슂.", 'warning');
      return;
    }
    const selectedText = model.getValueInRange(selection);

    const currentGenId = ++generationIdRef.current;

    // ?꾨━酉?移대뱶 ?닿퀬 ?곹깭 珥덇린??    setAiPreviewState({
      isOpen: true,
      originalRange: selection,
      streamingText: '',
      action,
      originalText: selectedText,
      isFinished: false
    });
    setFloatingToolbar(prev => ({ ...prev, visible: false }));

    try {
      await processTextWithAIStream(
        geminiApiKey,
        aiModelName,
        selectedText,
        action,
        (chunkText) => {
          if (currentGenId !== generationIdRef.current) return;
          if (chunkText === '') {
            return;
          }
          setAiPreviewState(prev => ({
            ...prev,
            streamingText: chunkText
          }));
        }
      );

      if (currentGenId !== generationIdRef.current) return;

      setAiPreviewState(prev => ({
        ...prev,
        isFinished: true
      }));
      showToast("AI 媛怨듭씠 ?꾨즺?섏뿀?듬땲?? 寃곌낵臾쇱쓣 寃?좏빐 二쇱꽭??", 'success');
    } catch (err: any) {
      if (currentGenId !== generationIdRef.current) return;
      showToast(err.message || "AI ?붿껌 ?ㅽ뙣", 'error');
      setAiPreviewState(prev => ({ ...prev, isOpen: false }));
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0028] MainEditorApp.tsx ??autoSaveRef_sync
  // ?렞 @KICK  : ?먮룞 ???濡쒖쭅?먯꽌 ?ㅽ뀒???대줈? 諛⑹?瑜??꾪빐 autoSaveRef瑜?autoSave ?곹깭? ?숆린??  // ?썳截?@GUARD : ?ㅽ뀒???대줈? 諛⑹? ?쒖뒪?쒖쓽 ?쇰?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  const autoSaveRef = useRef(autoSave);
  useEffect(() => { autoSaveRef.current = autoSave; }, [autoSave]);

  const isActivated = licenseStatus.isActivated;



  const decorationsCollectionRef = useRef<any>(null);
  const decorationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0029] MainEditorApp.tsx ??handleCheckboxToggle
  // ?렞 @KICK  : 誘몃━蹂닿린 泥댄겕諛뺤뒪 ?대┃???먮뵒??紐⑤뜽 ?쇱씤 肄섑뀗痢좎뿉 ?숆린??  // ?썳截?@GUARD : window.monaco 議댁옱 ?뺤씤, ?쇱씤 踰붿쐞 寃?? ?뺢퇋??寃利앹쑝濡?媛??  // ?슚 @PATCH : None
  // ?뵕 @CALLS : editor.getModel, editor.pushUndoStop, editor.executeEdits
  // ====================================================================
  const handleCheckboxToggle = useCallback((lineNumber: number, checked: boolean) => {
    if (!editorRef.current || typeof window === 'undefined' || !(window as any).monaco) return;
    const editor = editorRef.current;
    const model = editor.getModel();
    if (!model) return;

    if (lineNumber < 1 || lineNumber > model.getLineCount()) return;

    const lineContent = model.getLineContent(lineNumber);
    const checkboxRegex = /^([ \t]*[-*+]\s+\[)([ xX])(\].*)$/;
    const match = lineContent.match(checkboxRegex);

    if (match) {
      const [_, prefix, currentStatus, suffix] = match;
      const newStatus = checked ? 'x' : ' ';
      const newLineContent = `${prefix}${newStatus}${suffix}`;

      const Range = (window as any).monaco.Range;
      editor.pushUndoStop();
      editor.executeEdits("checkboxToggle", [
        {
          range: new Range(lineNumber, 1, lineNumber, lineContent.length + 1),
          text: newLineContent,
          forceMoveMarkers: true,
        }
      ]);
      editor.pushUndoStop();
    }
  }, []);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0030] MainEditorApp.tsx ??updateDecorations
  // ?렞 @KICK  : 留덊겕?ㅼ슫 援щЦ 媛뺤“(?쒕ぉ, 援듦쾶, 湲곗슱?? 痍⑥냼??瑜??꾪븳 ?몃씪??Monaco ?곗퐫?덉씠???곸슜
  // ?썳截?@GUARD : editor/window.monaco瑜??ъ슜?????놁쑝硫?嫄대꼫?
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : decorationsCollectionRef.current.set
  // ====================================================================
  const updateDecorations = useCallback((editor: any) => {
    if (!editor || typeof window === 'undefined' || !(window as any).monaco) return;
    const model = editor.getModel();
    if (!model) return;

    const lines = model.getLinesContent();
    const newDecorations: any[] = [];
    const Range = (window as any).monaco.Range;

    lines.forEach((line: string, i: number) => {
      const lineNumber = i + 1;

      // Heading
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const prefixLen = level + 1;
        newDecorations.push({
          range: new Range(lineNumber, 1, lineNumber, prefixLen + 1),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        const cName = level === 1 ? 'monaco-h1-text' : level === 2 ? 'monaco-h2-text' : 'monaco-h3-text';
        newDecorations.push({
          range: new Range(lineNumber, prefixLen + 1, lineNumber, line.length + 1),
          options: { inlineClassName: cName }
        });
      }

      // Bold
      const boldRegex = /\*\*(.*?)\*\*/g;
      let match;
      while ((match = boldRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 2),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 2, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 2, lineNumber, end - 2),
          options: { inlineClassName: 'monaco-bold-text' }
        });
      }

      // Italic
      const italicRegex = /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g;
      while ((match = italicRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 1),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 1, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 1, lineNumber, end - 1),
          options: { inlineClassName: 'monaco-italic-text' }
        });
      }

      // Strikethrough
      const strikeRegex = /~~(.*?)~~/g;
      while ((match = strikeRegex.exec(line)) !== null) {
        const start = match.index + 1;
        const end = start + match[0].length;
        newDecorations.push({
          range: new Range(lineNumber, start, lineNumber, start + 2),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, end - 2, lineNumber, end),
          options: { inlineClassName: 'monaco-md-syntax' }
        });
        newDecorations.push({
          range: new Range(lineNumber, start + 2, lineNumber, end - 2),
          options: { inlineClassName: 'monaco-strikethrough-text' }
        });
      }
    });

      if (decorationsCollectionRef.current) {
        decorationsCollectionRef.current.set(newDecorations);
      }
    }, []);
    const isResizing = useRef(false);
  // autoSaveRef, lastSavedContentRef????L1101)?먯꽌 ?대? ?좎뼵??  const isScrollingRef = useRef<'editor' | 'preview' | null>(null);
  const scrollTimeoutRef = useRef<any>(null);
  const prevCursorLineRef = useRef<number | null>(null);
  const contentChangeTimeoutRef = useRef<any>(null);
  const completionProviderRef = useRef<any>(null);
  const wikilinkProviderRef = useRef<any>(null);
  const docLinkFilesRef = useRef<FileNode[]>([]);
  const [floatingToolbar, setFloatingToolbar] = useState<{ visible: boolean, top: number, left: number }>({ visible: false, top: 0, left: 0 });
  const aiDecorationsRef = useRef<string[]>([]);
  const generationIdRef = useRef<number>(0);
  const readFileTextRef = useRef<(node: FileNode) => Promise<string>>(null!);
  const [aiPreviewState, setAiPreviewState] = useState<{
    isOpen: boolean;
    isModalOpen: boolean;
    promptInput: string;
    originalRange: any;
    streamingText: string;
    action: string;
    originalText: string;
    isFinished: boolean;
    isStarted: boolean;
    targetScope: 'selection' | 'document' | 'none';
  }>({
    isOpen: false,
    isModalOpen: false,
    promptInput: '',
    originalRange: null,
    streamingText: '',
    action: '',
    originalText: '',
    isFinished: false,
    isStarted: false,
    targetScope: 'none'
  });

  const [aiCopied, setAiCopied] = useState(false);

  // ?벑 紐⑤컮???곹깭 愿由щ? Rules of Hooks???곕씪 理쒖긽??Top-level)濡??곹뼢 議곗젙
  const [isMobile, setIsMobile] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    handleResize(); // 留덉슫???쒖젏 ?뺤씤
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);



  const cursorPositionRef = useRef<any>(null);
  const cursorSelectionRef = useRef<any>(null);
  const handlersRef = useRef<any>(null);
  const hotkeyDisposablesRef = useRef<any[]>([]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0031] MainEditorApp.tsx ??previewWheelSync
  // ?렞 @KICK  : 遺꾪븷 紐⑤뱶?먯꽌 誘몃━蹂닿린 ?곸뿭??留덉슦?????대깽?몃? ?먮뵒???ㅽ겕濡ㅻ줈 ?꾨떖
  // ?썳截?@GUARD : 湲곕낯 ?ㅽ겕濡?以묒?瑜??꾪빐 passive:false濡?e.preventDefault
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : editor.setScrollTop
  // ====================================================================
  useEffect(() => {
    const previewEl = previewRef.current;
    if (!previewEl) return;

    const handleWheel = (e: WheelEvent) => {
      if (previewModeRef.current === 'both' && editorRef.current) {
        e.preventDefault();
        const editor = editorRef.current;
        const currentScrollTop = editor.getScrollTop();
        editor.setScrollTop(currentScrollTop + e.deltaY);
      }
    };

    previewEl.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      previewEl.removeEventListener('wheel', handleWheel);
    };
  }, [previewMode]);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0032] MainEditorApp.tsx ??darkModeDOMClass
  // ?렞 @KICK  : Tailwind ?ㅽ겕 紐⑤뱶瑜??꾪빐 documentElement??'dark' ?대옒???좉?
  // ?썳截?@GUARD : SSR 遺덉씪移?諛⑹?瑜??꾪빐 留덉슫???꾩뿉留??ㅽ뻾
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : document.documentElement.classList.add/remove
  // ====================================================================

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('dark');
  }, [mounted]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0033] MainEditorApp.tsx ??editorSettingsSync
  // ?렞 @KICK  : ?ㅼ젙 ?먮뒗 ?먮뵒??留덉슫??蹂寃????뚮쭏, ?고듃 ?ш린, 以?諛붽퓞 ?ъ쟻??  // ?썳截?@GUARD : ?덉씠??而⑤뵒??諛⑹?瑜??꾪빐 mounted && isEditorReady濡?媛??  // ?슚 @PATCH : 2026-06-23 ???쇱씠?좎뒪 留뚮즺/?쒗븳 ?щ?(isExpired) 蹂寃???readOnly/domReadOnly ?숆린???곕룞 異붽?
  // ?뵕 @CALLS : monaco.editor.setTheme, editor.updateOptions, requestAnimationFrame
  // ====================================================================
  useEffect(() => {
    if (mounted && isEditorReady && editorRef.current) {
      // 1. ?뚮쭏 媛뺤젣 ?곸슜
      if ((window as any).monaco) {
        const monaco = (window as any).monaco;
        monaco.editor.setTheme(themePalette);
      }
      // 2. ?먮뵒???듭뀡(?고듃 ?ш린, 以?諛붽퓞, ?쎄린 ?꾩슜 ?щ?) 媛뺤젣 ?숆린??      editorRef.current.updateOptions({
        fontSize: fontSize,
        wordWrap: wordWrap,
        wordBreak: 'normal',
        readOnly: tabs.length === 0 || isRestrictedUser,
        domReadOnly: tabs.length === 0 || isRestrictedUser,
      });
      // 3. ?덉씠?꾩썐 由ы뵆濡쒖슦 媛뺤젣 ?몃━嫄?諛?鍮꾨룞湲??뱁룿??濡쒕뵫 ??湲?????ш퀎??(?듭떖 踰꾧렇 ?섏젙)
      requestAnimationFrame(() => {
        editorRef.current?.layout();
      });
      document.fonts.ready.then(() => {
        if ((window as any).monaco) {
          (window as any).monaco.editor.remeasureFonts();
        }
      });
    }
  }, [themePalette, fontSize, wordWrap, mounted, isEditorReady, isRestrictedUser, previewMode, tabs.length]);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0034] MainEditorApp.tsx ??darkModePaletteSync
  // ?렞 @KICK  : ?ㅽ겕紐⑤뱶(isDarkMode)??媛뺤젣 鍮꾪솢?깊솕?섏뼱 ?덉쑝誘濡??먮룞 ?뚮쭏 ?꾪솚???섑뻾?섏? ?딆쓬
  // ?썳截?@GUARD : ?놁쓬
  // ?슚 @PATCH : 2026-07-09 ???ㅽ겕 ?뚮쭏媛 isDarkMode=false?щ룄 媛뺤젣濡?onrivi-light濡??섎룎?ㅼ???踰꾧렇 ?섏젙. effect瑜?臾댄슚?뷀븯???ъ슜?먭? ?ㅼ젙?먯꽌 ?좏깮???뚮쭏瑜??좎??섎룄濡?蹂寃?
  // ?뵕 @CALLS : ?놁쓬
  // ====================================================================
  useEffect(() => {
    // isDarkMode????긽 false濡?怨좎젙?섏뼱 ?덉쑝誘濡??꾨Т ?숈옉???섏? ?딆쓬
  }, []);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0035] MainEditorApp.tsx ??profilesSave
  // ?렞 @KICK  : 蹂寃??쒕쭏???ъ슜??CSS ?꾨줈?꾩쓣 ?뚮옯????μ냼???좎?
  // ?썳截?@GUARD : 以묐났 諛⑹?瑜??꾪빐 ??????쒖뒪???꾨줈???꾪꽣留?  // ?슚 @PATCH : 2026-08-05 ????釉뚮씪?곗? 濡쒖뺄 沅뚰븳 ?뚯씪?쒖뒪??handle) ?ъ슜 ?쒖뿉??`profiles/userCssProfiles.json` 濡??듭씪 ??ν븯?꾨줉 濡쒖쭅 蹂寃?
  //             2026-07-30 ??resourceFolderHandle??蹂寃쎈맆 ???댁쟾 鍮??꾨줈??profiles) ?곹깭濡???뼱?곕뒗 踰꾧렇 諛⑹? (?섏〈??遺꾨━)
  // ?뵕 @CALLS : api.saveProfiles, localStorage.setItem
  // ====================================================================
  useEffect(() => {
    if (!mounted || !isProfilesLoaded) return;
    const userProfiles = profiles.filter(p => !isSystemProfileId(p.id));
    const api = (window as any).electronAPI;
    
    // Check if the profiles array actually changed to avoid redundant saves
    const savedHash = JSON.stringify(userProfiles);
    if ((window as any)._lastSavedProfilesHash === savedHash) return;
    (window as any)._lastSavedProfilesHash = savedHash;

    if (api) {
      // Desktop: electronAPI ???      api.saveProfiles(userProfiles, resourceFolder);
    } else {
      // Addon/Browser: localStorage
      try { localStorage.setItem('userCssProfiles', JSON.stringify(userProfiles)); } catch { }
      
      // File System Access API瑜??듯븳 濡쒖뺄 ?대뜑 ???      const handle = resourceFolderHandleRef?.current || resourceFolderHandle;
      if (handle && (window as any)._resourceFolderSynced) {
        (async () => {
          try {
            const profilesDir = await (handle as any).getDirectoryHandle('profiles', { create: true });
            const fileHandle = await profilesDir.getFileHandle('userCssProfiles.json', { create: true });
            const writable = await fileHandle.createWritable();
            await writable.write(JSON.stringify(userProfiles, null, 2));
            await writable.close();
          } catch (err) {
            console.warn('[profilesSave] Failed to save profiles to resource folder handle:', err);
          }
        })();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profiles]);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0036] MainEditorApp.tsx ??activeProfileSave
  // ?렞 @KICK  : ?쒖꽦 CSS ?꾨줈??ID瑜?localStorage???좎?
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : localStorage.setItem
  // ====================================================================
  useEffect(() => {
    if (mounted && activeProfileId) {
      localStorage.setItem('activeCssProfileId', activeProfileId);
    }
  }, [activeProfileId, mounted]);


  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0000] MainEditorApp.tsx ??Sync Frontmatter Profile
  // ?렞 @KICK  : ?먮뵒??蹂몃Ц(content)??蹂寃쎈맆 ??Frontmatter?먯꽌 css_profile??異붿텧?섏뿬 ?꾩옱 ?쒖떇(activeProfileId)???숆린??  // ?썳截?@GUARD : 湲곗〈 activeProfileId? ?ㅻ? ?뚮쭔 ?낅뜲?댄듃?섏뿬 臾댄븳猷⑦봽 諛⑹?
  // ?슚 @PATCH : 2026-07-30 (Frontmatter ?쒖떇 媛쒕퀎 吏??吏??
  // ?뵕 @CALLS : extractFrontmatter, setActiveProfileId
  // ====================================================================
  useEffect(() => {
    const { data } = extractFrontmatter(content);
    if (data.css_profile && data.css_profile !== activeProfileId) {
      setActiveProfileId(data.css_profile);
    }
  }, [content, activeProfileId]);

  // ====================================================================
  // ?뱤 [OMD-IO-MainEditorApp-0037] MainEditorApp.tsx ??electronAPI_listeners
  // ?렞 @KICK  : ?뚯씪 ?묒뾽 諛??몃? ?뚯씪 ?닿린瑜??꾪븳 Electron 硫붿씤 ?꾨줈?몄뒪 IPC 由ъ뒪???깅줉
  // ?썳截?@GUARD : ?뺣━ ??由ъ뒪???쒓굅, 蹂대쪟 以묒씤 ?몃? ?뚯씪 李몄“ 泥섎━
  // ?슚 @PATCH : **2026-06-28** ??理쒖큹 ?ㅽ뻾 ??api.getInitialFilePath() ?몄텧??異붽??섏뿬 ?덈룄???먯깋湲?諛뷀깢?붾㈃?먯꽌
  //             .md ?뚯씪 ?붾툝?대┃ ????湲곕룞 ???대떦 ?뚯씪???먮룞?쇰줈 ?대━?꾨줉 IPC ?곌껐 ?⑥튂
  // ?뵕 @CALLS : api.onNewFileRequested, api.onSaveFileRequested, api.onSaveFileAsRequested, api.onReceiveFile, api.getInitialFilePath, openExternalFile, handlers.newFile, handlers.save, handlers.saveAs
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      const api = (window as any).electronAPI;
      api.onNewFileRequested(() => { });
      api.onSaveFileRequested(() => handlers.save());
      api.onSaveFileAsRequested(() => handlers.saveAs());

      // ?덈룄???뚯씪 ?곌껐(?붾툝?대┃)濡??몃? .md ?뚯씪 ?닿린 ?붿껌 ?섏떊 (??踰덉㎏ ?ㅽ뻾遺??
      let unsubscribeReceiveFile: (() => void) | undefined;
      if (api.onReceiveFile) {
        unsubscribeReceiveFile = api.onReceiveFile((filePath: string) => {
          openExternalFile(filePath);
        });
      }

      // ?넅 理쒖큹 ?ㅽ뻾 ?? .md ?붾툝?대┃ ?뚯씪 ?곗꽑, ?놁쑝硫?留덉?留??몄뀡 ?뚯씪 蹂듭썝
      // sessionRestoredRef濡?effect ?ъ떎????以묐났 ?몄텧 諛⑹?
      if (api.getInitialFilePath && !sessionRestoredRef.current) {
        api.getInitialFilePath().then(async (filePath: string | null) => {
          if (filePath) {
            sessionRestoredRef.current = true;
            openExternalFile(filePath);
          } else if (api.getLastSession && tabs.length === 0) {
            const sessionData = await api.getLastSession();
            if (sessionData && Array.isArray(sessionData.openFilePaths) && sessionData.openFilePaths.length > 0) {
              await restoreSessionTabs(sessionData.openFilePaths, sessionData.activeFilePath);
            } else {
              sessionRestoredRef.current = true; // 蹂듭썝???몄뀡 ?놁쓬
            }
          } else {
            sessionRestoredRef.current = true; // 蹂듭썝???붾툝?대┃ 寃쎈줈 ?놁쓬
          }
        }).catch(() => { sessionRestoredRef.current = true; });
      }

      // restoreSettings?먯꽌 ?뺣낫????pending ?뚯씪 寃쎈줈 泥섎━ (?대갚)
      if (pendingExternalFileRef.current) {
        const path = pendingExternalFileRef.current;
        pendingExternalFileRef.current = null;
        openExternalFile(path);
      }

      return () => {
        api.removeListeners();
        if (unsubscribeReceiveFile) unsubscribeReceiveFile();
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, content, currentFileNode]);

  // ====================================================================
  // ?뱤 [OMD-IO-MainEditorApp-0044] MainEditorApp.tsx ??cross_platform_session_restore
  // ?렞 @KICK  : ?쇰컲 ??釉뚮씪?곗? 諛??곗뒪?ы깙 怨듭슜?쇰줈 理쒖큹 湲곕룞 ??localStorage???몄뀡 ?뺣낫瑜??쎌뼱 ??蹂듭썝??媛쒖떆.
  // ?썳截?@GUARD : ?대? ?곗뒪?ы깙 蹂듭썝 媛?쒓? ?뚯븯嫄곕굹 ??씠 蹂듭썝???곹깭?쇰㈃ 以묐났 濡쒕뱶 李⑤떒.
  // ?슚 @PATCH : **2026-08-12** ??珥덇린 ?앹꽦 (???곗뒪?ы깙 怨듭슜 ???몄뀡 蹂듭썝 蹂듦뎄)
  // ?뵕 @CALLS : restoreSessionTabs
  // ====================================================================
  useEffect(() => {
    if (!mounted) return;

    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
    const isElectron = !!api;

    // ?쇰젆?몃줎???꾨땶 ?쇰컲 ???섍꼍?닿퀬 ?꾩쭅 蹂듭썝???섏? ?딆븯?ㅻ㈃ 蹂듦뎄 ?꾨줈?몄뒪 媛??    if (!isElectron && !sessionRestoredRef.current) {
      try {
        const saved = localStorage.getItem('onrivi_tabs_session');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed && Array.isArray(parsed.tabs) && parsed.tabs.length > 0) {
            const openFilePaths = parsed.tabs.map((t: any) => t.path).filter(Boolean);
            const activeFilePath = parsed.activeTabId || null;
            restoreSessionTabs(openFilePaths, activeFilePath);
            return;
          }
        }
      } catch (e) {
        console.error('[web session restore] ?ㅽ뙣:', e);
      }
      sessionRestoredRef.current = true; // 蹂듭썝???뺣낫 ?놁쑝硫??뚮옒洹??댁젣
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted]);

  // ====================================================================
  // ?뱤 [OMD-IO-MainEditorApp-0039] MainEditorApp.tsx ??session_auto_save
  // ?렞 @KICK  : ?꾩옱 ?대젮?덈뒗 ??紐⑸줉 ?먮뒗 ?쒖꽦 ??씠 蹂寃쎈맆 ?뚮쭏??electronAPI.saveLastSession()??  //             ?몄텧?섏뿬 紐⑤뱺 ?대┛ ?뚯씪 寃쎈줈? ?쒖꽦 ?뚯씪 寃쎈줈瑜?session.json???먮룞 ???
  //             ???ъ떆????session:getLastSession IPC濡?洹몃?濡?蹂듭썝??
  // ?썳截?@GUARD : Electron ?섍꼍?먯꽌留??숈옉. ??ν븷 ?뚯씪 紐⑸줉???놁쑝硫?鍮??몄뀡 ???
  // ?슚 @PATCH : **2026-08-12** ??硫?????꾩껜 蹂듭썝 ?숆린??湲곕뒫?쇰줈 怨좊룄??媛쒗렪
  // ?뵕 @CALLS : api.saveLastSession
  // ====================================================================
  useEffect(() => {
    // ?뮕 [移섎챸??踰꾧렇 諛⑹뼱] ??留덉슫??珥덇린 ?④퀎(?몄뀡 蹂듭썝??梨??꾨즺?섏? ?딆? ?쒖젏)??    // 珥덇린 鍮????곹깭([])媛 session.json?대굹 localStorage瑜???뼱?뚯썙 ?좊젮踰꾨━??寃고븿??李⑤떒?⑸땲??
    if (!mounted || !sessionRestoredRef.current) return;

    const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;

    // 1. 釉뚮씪?곗? 濡쒖뺄 ?ㅽ넗由ъ? 蹂댁〈 (??& ?곗뒪?ы깙 怨듭슜)
    if (typeof window !== 'undefined') {
      try {
        const sessionTabsData = tabs.map(t => ({
          id: t.id,
          name: t.name,
          path: t.path,
          isStyleTab: t.isStyleTab
        }));
        localStorage.setItem('onrivi_tabs_session', JSON.stringify({
          tabs: sessionTabsData,
          activeTabId
        }));
      } catch (e) {
        console.error('[session_auto_save] localStorage ?곌린 ?ㅽ뙣:', e);
      }
    }

    // 2. ?쇰젆?몃줎 ?몄뀡 蹂댁〈 (?곗뒪?ы깙 ?꾩슜 ?뚯씪 諛깆뾽)
    if (api?.saveLastSession) {
      const openFilePaths = tabs.map(t => t.path).filter((p): p is string => typeof p === 'string' && !!p);
      const activeFilePath = currentFileNode?.path || null;
      api.saveLastSession({
        openFilePaths,
        activeFilePath
      }).catch(() => {});
    }
  }, [mounted, tabs, activeTabId, currentFileNode]);

  // ====================================================================
  // ?뱤 [OMD-IO-MainEditorApp-0041] MainEditorApp.tsx ??a4_guard_auto_save
  // ?렞 @KICK  : isA4GuardEnabled 媛???곹깭媛 蹂寃쎈맆 ?뚮쭏??localStorage??利됱떆 蹂댁〈.
  // ?썳截?@GUARD : Electron 諛??쇰컲 釉뚮씪?곗? ?섍꼍 吏??  // ?슚 @PATCH : **2026-08-12** ??珥덇린 ?앹꽦 (A4 媛???덉씠?꾩썐 蹂댁〈 湲곕뒫)
  // ?뵕 @CALLS : ?놁쓬
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('isA4GuardEnabled', String(isA4GuardEnabled));
    }
  }, [isA4GuardEnabled]);

  // ====================================================================
  // ?뱤 [OMD-IO-MainEditorApp-0042] MainEditorApp.tsx ??beforeunload_safety_flush
  // ?렞 @KICK  : 釉뚮씪?곗?媛 ?덇린移??딄쾶 ?ロ엳嫄곕굹 媛뺤젣 醫낅즺???? React 媛깆떊 吏???곹깭瑜?臾댁떆?섍퀬
  //             Ref(tabsRef, currentFileNodeRef)瑜?吏곸젒 ?쎌뼱 localStorage 諛?session.json??利됯컖 ?뚮윭?????
  // ?썳截?@GUARD : React 理쒖떊 Ref 李몄“濡??숆린???꾨씫 諛⑹?.
  // ?슚 @PATCH : **2026-08-12** ??珥덇린 ?앹꽦 (媛뺤젣 醫낅즺 ?좎떎 諛⑹? 媛??
  // ?뵕 @CALLS : api.saveLastSession
  // ====================================================================
  useEffect(() => {
    const handleBeforeUnload = () => {
      const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
      
      // 1. 釉뚮씪?곗? 濡쒖뺄 ?ㅽ넗由ъ???留덉?留??묒꽦以묒씤 臾몄꽌 硫뷀??곗씠??諛遊??뚮윭??      if (typeof window !== 'undefined') {
        try {
          const sessionTabsData = tabsRef.current.map(t => ({
            id: t.id,
            name: t.name,
            path: t.path,
            isStyleTab: t.isStyleTab
          }));
          localStorage.setItem('onrivi_tabs_session', JSON.stringify({
            tabs: sessionTabsData,
            activeTabId: activeTabIdRef.current
          }));
        } catch (e) {}
      }

      // 2. ?곗뒪?ы깙 ?뚯씪 諛깆뾽 ?뚮윭??      if (api?.saveLastSession) {
        const openFilePaths = tabsRef.current.map(t => t.path).filter((p): p is string => typeof p === 'string' && !!p);
        const activeFilePath = currentFileNodeRef.current?.path || null;
        api.saveLastSession({ openFilePaths, activeFilePath }).catch(() => {});
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);


  // ?렞 @KICK  : ?ъ씠?쒕컮 UI?먯꽌 ?쒖떇??蹂寃쏀뻽???? ?먮뵒??蹂몃Ц??Frontmatter瑜?二쇱엯/媛깆떊?섍퀬 ?곹깭瑜??낅뜲?댄듃?쒕떎.
  // ?썳截?@GUARD : Monaco 紐⑤뜽 媛믪씠 蹂寃쎈맆 ???먮룞?쇰줈 onDidChangeContent媛 ?몃━嫄곕릺誘濡?setContent??蹂꾨룄 ?몄텧?섏? ?딆쓬.
  // ?슚 @PATCH : 2026-07-30 (Frontmatter ?쒖떇 媛쒕퀎 吏??吏??
  // ?뵕 @CALLS : updateCssProfileInFrontmatter, setActiveProfileId
  // ====================================================================
  const handleProfileChange = useCallback((newProfileId: string) => {
    setActiveProfileId(newProfileId);
    
    // ?쒖떇 ?대쫫 李얘린
    const selectedProfile = profiles.find(p => p.id === newProfileId);
    const profileName = selectedProfile ? selectedProfile.name : undefined;
    
    if (editorRef.current) {
      const currentModel = editorRef.current.getModel();
      if (currentModel) {
        const currentContent = currentModel.getValue();
        const newContent = updateCssProfileInFrontmatter(currentContent, newProfileId, profileName);
        if (currentContent !== newContent) {
          currentModel.setValue(newContent);
          // Monaco onDidChangeContent ?대깽?멸? 諛쒖깮?섏뿬 ??낵 content ?곹깭媛 ?먮룞?쇰줈 媛깆떊??        }
      }
    }
  }, [setActiveProfileId, editorRef, profiles]);

  // ?윟 [沅뚰븳 湲곕컲 珥덇린 ?붾㈃ ?쒖뼱: ?곗뺨 ???곴뎄 ?좉툑 諛?媛뺤젣 ?몄텧 濡쒖쭅 2026-07-05]
  const prevRestrictedRef = useRef<boolean | null>(null);
  useEffect(() => {
    if (!mounted || isLicenseChecking) return;

    // ?쒗븳 ?ъ슜??議곌굔: ?ъ슜 湲곌컙 留뚮즺 ?뱀? ?뱀뿉???숈떆 ?묒냽??珥덇낵?섏뿬 ?몄쬆???곸떎??寃쎌슦
    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('誘몄씤利?) ||
      licenseStatus.planName?.includes('?쒗븳?ъ슜??);

    if (prevRestrictedRef.current === isRestrictedUser) return;
    prevRestrictedRef.current = isRestrictedUser;

    
      setTabs(prev => {
        const hasWelcome = prev.some(t => t.name === 'Onrivi Author ?쒖옉?섍린.md' && !t.isStyleTab);
        if (!hasWelcome) return prev;
        const cleaned = prev.filter(t => !(t.name === 'Onrivi Author ?쒖옉?섍린.md' && !t.isStyleTab));
        if (cleaned.length === 0) {
          setActiveTabId(null);
          setContent(localStorage.getItem('onrivi_content') || '');
          setCurrentFileName('???뚯씪.md');
          setCurrentFileNode(null);
        }
        return cleaned;
      });
    
  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName, licenseStatus.isRestricted]);

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0043] MainEditorApp.tsx ??restoreSessionTabs
  // ?렞 @KICK  : ???ъ떆???? ?댁쟾 ?몄뀡???뚯씪 紐⑸줉 ?꾩껜瑜??쇨큵 濡쒕뱶?섏뿬 ??由ъ뒪?몃? ?앹꽦 諛?諛붿씤??
  //             ?⑥씪 ?쇨큵 ?몃옖??뀡 泥섎━濡?React ?곹깭 媛깆떊 諛곗튂 異⑸룎 諛?Monaco 紐⑤뜽 以묐났 諛⑹?.
  // ?썳截?@GUARD : 鍮꾩씤利??ъ슜??蹂듭썝 ?쒗븳, ?붿뒪????젣 ?뚯씪 ?덉쇅 媛??
  // ?슚 @PATCH : **2026-08-12** ??珥덇린 ?앹꽦 (硫????蹂듭썝 異⑸룎 踰꾧렇 ?닿껐)
  // ?뵕 @CALLS : api.readFromPath, setTabs, setActiveTabId, setContent, showToast
  // ====================================================================
  const restoreSessionTabs = async (openFilePaths: string[], activeFilePath: string | null) => {
    try {
      // ?뮕 [?뺤떇 臾몄꽌 ?닿린 ?곸슜] ?⑥닚????쭔 ?꾩쓽濡?諛곗뿴???ㅼ뀛?ｌ? ?딄퀬, 
      // 湲곗〈 ?뚯씪 ?먯깋湲곗쓽 ?ㅼ젣 ?뚯씪 ?ㅽ뵂 ?뚯씠?꾨씪??handleFileOpenByPath)???쒖감 援щ룞?쒗궢?덈떎.
      // ?대젃寃??댁빞 ?ㅼ젣 濡쒖뺄 ?뚯씪 ?쒖뒪???몃뱾 諛?VFS ?곹깭媛 ?뺤긽 諛붿씤?⑸릺??臾쇰━????μ씠 ?묐룞?⑸땲??
      // React ?곹깭 諛곗튂 媛깆떊 吏?곗쑝濡??명븳 ???좎떎??諛⑹??섍린 ?꾪빐 ??떦 150ms??留덉씠?щ줈 ?湲??쒓컙??遺?ы빀?덈떎.
      
      sessionRestoredRef.current = true; // 蹂듭썝 ?꾨줈?몄뒪 ?쒖옉怨??숈떆??true ?ㅼ젙?섏뿬 ??뼱?곌린 利됱떆 李⑤떒!

      for (const filePath of openFilePaths) {
        if (handleFileOpenByPath) {
          await handleFileOpenByPath(filePath);
          await new Promise(resolve => setTimeout(resolve, 150));
        }
      }

      // 留덉?留됱뿉 ?먮옒 ?쒖꽦???곹깭?????쑝濡???踰????뺤떇 ?ъ빱?ㅻ? ?≪븘以띾땲??
      if (activeFilePath && handleFileOpenByPath) {
        await handleFileOpenByPath(activeFilePath);
      }
      
      showToast(`?뱛 ?댁쟾 ?몄뀡??臾몄꽌 ${openFilePaths.length}媛쒓? ?⑥쟾??蹂듭썝?섏뿀?듬땲??`, "success");
    } catch (err) {
      console.error("[restoreSessionTabs] ?ㅻ쪟:", err);
    }
  };


  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0038] MainEditorApp.tsx ??openExternalFile
  // ?렞 @KICK  : OS ?섏? ?붾툝?대┃ ?먮뒗 紐낅졊以꾩뿉???뚯씪 ?닿린, Monaco 紐⑤뜽濡????앹꽦
  // ?썳截?@GUARD : 以묐났 ??諛⑹? 諛?湲곗〈 ??諛쒓껄 ??理쒖떊 而⑦뀗痢?媛뺤젣 ?뚮윭??媛깆떊
  // ?슚 @PATCH : ?숈씪 ?뚯씪紐?寃쎈줈 ?ы샇異???臾대컲??踰꾧렇 ?섏젙: setModel 諛?content 媛뺤젣 ?숆린??(2026-07-17)
  // ?뵕 @CALLS : api.readFromPath, switchTab, setContent, showToast
  // ====================================================================
  const openExternalFile = async (filePath: string) => {
    try {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        const file = await api.readFromPath(filePath);
        if (file) {
          const existingTab = tabsRef.current.find(t => t.path === file.path);

          if (existingTab) {
            if (existingTab.model && existingTab.model.isDisposed()) {
              const cleaned = tabsRef.current.filter(t => t.id !== existingTab.id);
              tabsRef.current = cleaned;
              setTabs(cleaned);
            } else {
              // ?렞 [?꾪뻾???⑥튂] 湲곗〈 ??씠 議댁옱?섎㈃ ?ъ빱?ㅻ? ?대룞?섍퀬 理쒖떊 ?먮Ц ?곗씠?곕? 媛뺤젣 二쇱엯
              switchTab(existingTab.id);
              setContent(file.content);
              setCurrentFileName(file.name);
              setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });

              if (existingTab.model) {
                // 湲곗〈 紐⑤뜽???몃??먯꽌 諛붾?理쒖떊 ?띿뒪?몃? 媛뺤젣濡???뼱?뚯?
                existingTab.model.setValue(file.content);
                if (editorRef.current) {
                  try {
                    editorRef.current.setModel(existingTab.model);
                  } catch (e) {
                    console.warn("[Monaco] setModel failed on existing tab:", e);
                  }
                }
              }

              showToast(`?뱛 ${file.name} (理쒖떊???꾨즺)`, "info");
              return;
            }
          }

          // --- ?댄븯 ?좉퇋 ???앹꽦 濡쒖쭅? 湲곗〈怨??숈씪 ---
          // [Bug Fix] CRLF瑜?LF濡??뺢퇋?뷀븯??Monaco getValue()???鍮꾧탳 ??isModified媛 ?ㅼ옉?숉븯??臾몄젣 ?닿껐
          file.content = file.content.replace(/\r\n/g, '\n');

          const monaco = (window as any).monaco;
          let model: any = null;
          if (monaco) {
            model = monaco.editor.createModel(file.content, 'markdown');
            model.onDidChangeContent(() => {
              const val = model.getValue();
              setContent(val);
              setTabs(prev => prev.map(t => t.id === file.path ? { ...t, content: val, isModified: val !== t.content } : t));
            });
          }

          const newTabId = file.path;
          const newTab: EditorTab = {
            id: newTabId,
            name: file.name,
            path: file.path,
            node: { name: file.name, kind: 'file', path: file.path },
            content: file.content,
            isModified: false,
            model: model
          };

          setTabs(prev => [...prev, newTab]);
          setActiveTabId(newTabId);
          setContent(file.content);
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', path: file.path });

          if (editorRef.current && model) {
            try {
              editorRef.current.setModel(model);
            } catch (e) {
              console.warn("[Monaco] setModel failed on new tab:", e);
            }
          }
          showToast(`?뱛 ${file.name}`, "info");
          return;
        }
      }
      await handleFileOpenByPath(filePath);
    } catch (e) {
      showToast('?뚯씪???????놁뒿?덈떎.', 'error');
    }
  };

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0039] MainEditorApp.tsx ??welcomeContentLoad
  // ?렞 @KICK  : 泥?留덉슫??????씠 ?녾퀬 蹂대쪟 以묒씤 ?몃? ?뚯씪???놁쑝硫??곗뺨 肄섑뀗痢?濡쒕뱶
  // ?썳截?@GUARD : pendingExternalFileRef媛 ?ㅼ젙?섏뼱 ?덉쑝硫?嫄대꼫? (?뚯씪 ?닿린濡??곌린)
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : getWelcomeContent, setTabs, setActiveTabId, setContent, setCurrentFileName
  // ====================================================================
  // ?뮕 珥덇린 鍮???쓣 ?앹꽦?섏? ?딆쓬 ???ъ슜?먮뒗 ?먯깋湲곗뿉?쒕쭔 ?뚯씪???닿굅???앹꽦?????덉쓬

  // ?뮕 [議곗튂 ?꾨즺] ?좊뱶??援щ룞 ???ъ슜?먯쓽 ?대┰蹂대뱶 ?댁슜???숈쓽 ?놁씠 媛뺤젣 ?쎄린 ?섏뿬 泥??곗뺨?섏씠吏瑜?臾댁“嫄???뼱?곕뜕 濡쒖쭅???쒓굅(二쇱꽍 泥섎━)?섏뿬 ?곗뺨 ?섏씠吏 ?몄텧??蹂댁옣?⑸땲??
  // useEffect(() => {
  //   if (mounted && isAddonEnv && typeof navigator !== 'undefined' && navigator.clipboard) {
  //     (async () => {
  //       try {
  //         const text = await navigator.clipboard.readText();
  //         if (text) {
  //           updateContent(text);
  //           lastSavedContentRef.current = text;
  //         }
  //       } catch (e) {
  //         // ?대┰蹂대뱶 ?쎄린 ?ㅽ뙣 (沅뚰븳 ?놁쓬 ?? - 臾댁떆
  //       }
  //     })();
  //   }
  // }, [mounted]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0040] MainEditorApp.tsx ??dynamicTitleBar
  // ?렞 @KICK  : document.title??'Onrivi Author'濡?怨좎젙 (??UI媛 ?뚯씪紐??쒖떆?섎?濡?
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : 2026-06-22 ???뚯씪紐??쒓굅, 'Onrivi Author'留??쒖떆 (??쑝濡??泥?
  // ?뵕 @CALLS : None
  // ====================================================================
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.title = 'Onrivi Author';
    }
  }, []);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0041] MainEditorApp.tsx ??previewHighlightLine
  // ?렞 @KICK  : 遺꾪븷 紐⑤뱶?먯꽌 ?먮뵒?곗쓽 activeLine怨??쇱튂?섎뒗 誘몃━蹂닿린 以?媛뺤“
  // ?썳截?@GUARD : 以묐났 諛⑹?瑜??꾪빐 紐⑤뱺 媛뺤“ 癒쇱? ?쒓굅, 遺덉씪移??꾩튂?????媛??媛源뚯슫 ?섏쐞 data-line 李얘린
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : element.classList.add/remove
  // ====================================================================
  useEffect(() => {
    if (!previewRef.current) return;

    const elements = Array.from(previewRef.current.querySelectorAll('[data-line]')) as HTMLElement[];
    elements.forEach(element => element.classList.remove('preview-highlight-line'));

    if (previewMode !== 'both' || !activeLine) return;

    // activeLine ?댄븯?대㈃??媛??媛源뚯슫(理쒕?媛? data-line??媛吏??붿냼瑜?李얠쓬
    let targetEl: HTMLElement | null = null;
    let maxLine = -1;

    elements.forEach(element => {
      const lineStr = element.getAttribute('data-line');
      if (lineStr) {
        const line = parseInt(lineStr, 10);
        if (line <= activeLine && line > maxLine) {
          maxLine = line;
          targetEl = element;
        }
      }
    });

    if (targetEl) {
      (targetEl as HTMLElement).classList.add('preview-highlight-line'); // ?뮕 ?ъ옣??吏?? 留덉슦???대┃/??댄븨 ??誘몃━蹂닿린 ??留덊궧 ?섏씠?쇱씠?몄깋 蹂듦뎄
    }
  }, [activeLine, previewMode]);

  // ?뮕 [OMD-SYNC-DEPRECATED] ?ㅽ겕濡??숆린??諛???李⑤떒 濡쒖쭅? Monaco Setup ?대? ?⑥씪 由ъ뒪??onDidScrollChange)濡??꾩쟾??留덉씠洹몃젅?댁뀡?섏뼱 ?닿납??以묐났 ?낆? ??젣?섏뿀?듬땲??

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0043] MainEditorApp.tsx ??handleMouseMove
  // ?렞 @KICK  : ?ъ씠?쒕컮 ?ш린 議곗젙 ?쒕옒洹?mousemove ?대깽??泥섎━
  // ?썳截?@GUARD : ?덈퉬瑜?150-600px ?ъ씠濡??쒗븳
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : setSidebarWidth, localStorage.setItem
  // ====================================================================

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 150 && newWidth < 600) {
      setSidebarWidth(newWidth);
      localStorage.setItem('sidebarWidth', newWidth.toString());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fontSize 諛?wordWrap ??μ? ?듯빀 ?섍꼍?ㅼ젙 ???媛?쒖뿉??泥섎━

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0044] MainEditorApp.tsx ??stopResizing
  // ?렞 @KICK  : ?ъ씠?쒕컮 ?ш린 議곗젙 醫낅즺: 由ъ뒪???쒓굅, 而ㅼ꽌 諛?user-select 蹂듭썝
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : document.removeEventListener, document.body.style.cursor/userSelect
  // ====================================================================
  const stopResizing = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'default';
    document.body.style.userSelect = 'auto';
  }, [handleMouseMove]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0045] MainEditorApp.tsx ??startResizing
  // ?렞 @KICK  : ?ъ씠?쒕컮 ?ш린 議곗젙 ?쒖옉: 由ъ뒪??異붽?, col-resize 而ㅼ꽌 ?ㅼ젙
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : document.addEventListener, document.body.style
  // ====================================================================
  const startResizing = useCallback((e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopResizing);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [handleMouseMove, stopResizing]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0046] MainEditorApp.tsx ??tabModeSync
  // ?렞 @KICK  : ???꾪솚 ???꾩?留먯? 誘몃━蹂닿린 ?꾩슜?쇰줈 媛뺤젣?섍퀬 ?쇰컲 臾몄꽌??吏곸쟾???꾩뿭 ?먮뵒??紐⑤뱶濡?蹂듦뎄 ?숆린??  // ?썳截?@GUARD : ?쇱씠?좎뒪 留뚮즺 ??preview 紐⑤뱶濡?媛??  // ?슚 @PATCH : 2026-07-04 ???좉퇋 異붽?
  // ?뵕 @CALLS : setPreviewModeRaw
  // ====================================================================
  useEffect(() => {
    if (!mounted || !activeTabId) return;
    const activeTab = tabs.find(t => t.id === activeTabId);
    if (!activeTab) return;

    if (activeTab.name === '?꾩?留?md') {
      // ?뮕 1. ?꾩?留???? ?덉쇅?놁씠 臾댁“嫄?誘몃━蹂닿린 ?꾩슜('preview') 怨좎젙
      if (previewModeRef.current !== 'preview') {
        setPreviewModeRaw('preview');
        previewModeRef.current = 'preview';
      }
    } else if (activeTab.isStyleTab === true) {
      // ?뮕 2. ?쒖떇?ㅼ젙 ?꾩슜 ?? 紐⑤뱶 ?꾪솚 ?놁씠 ?꾩옱 紐⑤뱶 ?좎? (CssStyleForm? Ctrl+Shift+S濡쒕쭔 ?좉?)
    } else {
      // ?뮕 3. 洹????쇰컲 留덊겕?ㅼ슫 臾몄꽌?ㅼ? ?꾩뿭?쇰줈 怨듭쑀?섎뒗 留덊겕?ㅼ슫 蹂닿린 紐⑤뱶瑜?洹몃?濡??곸냽 諛??좎?
      const target = isRestrictedUser ? 'preview' : lastGeneralPreviewModeRef.current;
      if (previewModeRef.current !== target) {
        setPreviewModeRaw(target);
        previewModeRef.current = target;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTabId, mounted, isRestrictedUser, helpContent]);
  // ?윟 [沅뚰븳 湲곕컲 珥덇린 ?붾㈃ ?쒖뼱: ?곗뺨 ??李⑤떒 諛?媛뺤젣 ?몄텧 濡쒖쭅 2026-07-05]
  // 珥덇린 濡쒕뵫 ???쒗븳 ?ъ슜?먯씤吏 ?먮떒?섏뿬 ?곗뺨 ?섏씠吏瑜??④린嫄곕굹, ?쇰컲 ?ъ슜?먮㈃ 吏?곷땲??
  const hasHandledWelcomeRef = useRef(false);

  useEffect(() => {
    if (!mounted || isLicenseChecking || hasHandledWelcomeRef.current) return;

    console.log('[WELCOME#2] FIRED! isExpired=%o planName=%o tabsRef=%o', licenseStatus.isExpired, licenseStatus.planName, tabsRef.current.map((t: any) => t.name));

    // ?댄럺?몃? ????踰덈쭔 ?ㅽ뻾?섏뿬 ?ㅻⅨ 而댄룷?뚰듃???낆씠 ?곗뺨??쓣 ??뼱?곌굅??臾댄븳猷⑦봽 ?꾨뒗 寃껋쓣 ?먯쿇 諛⑹?
    hasHandledWelcomeRef.current = true;

    // ?쒗븳 ?ъ슜??議곌굔: ?ъ슜 湲곌컙 留뚮즺 ?뱀? ?뱀뿉???숈떆 ?묒냽??珥덇낵?섏뿬 ?몄쬆???곸떎??寃쎌슦 (undefined 諛⑹뼱瑜??꾪빐 Optional Chaining 異붽?)
    const isRestrictedUser = licenseStatus.isExpired ||
      licenseStatus.isRestricted ||
      licenseStatus.planName?.includes('誘몄씤利?) ||
      licenseStatus.planName?.includes('?쒗븳?ъ슜??);

    // tabs ?곹깭媛????refs濡??꾩옱 ?곹솴???덉쟾?섍쾶 ?ㅻ깄??    const hasWelcome = tabsRef.current.some(t => t.name === 'Onrivi Author ?쒖옉?섍린.md' && !t.isStyleTab);

      // 1. [?뺤긽/?꾩껜 ?ъ슜??: ?곗뺨 ?섏씠吏 媛뺤젣 ??젣 (鍮?臾몄꽌 ?쒖옉)
      if (hasWelcome) {
        const cleaned = tabsRef.current.filter(t => !(t.name === 'Onrivi Author ?쒖옉?섍린.md' && !t.isStyleTab));
        setTabs(cleaned);
        if (cleaned.length === 0) {
          setActiveTabId(null);
          // ?쒖옉 ?섏씠吏 ?놁씠(Empty) ?쒖옉?섎룄濡??붿껌??-> 濡쒖뺄 ?ㅽ넗由ъ????⑥븘?덈뒗 寃??덈떎硫?蹂듭썝?섍굅??鍮?臾몄옄??
          const localDraft = localStorage.getItem('onrivi_content');
          setContent(localDraft || '');
          setCurrentFileName('???뚯씪.md');
          setCurrentFileNode(null);
        }
    }
  }, [mounted, isLicenseChecking, licenseStatus.isExpired, licenseStatus.planName, licenseStatus.isRestricted]);
  useEffect(() => {
    if (currentFileNode && activeTabId) {
      if (prevActiveTabRef.current !== activeTabId) {
        prevActiveTabRef.current = activeTabId;
          const activeTab = tabsRef.current.find(t => t.id === activeTabId);
          if (!activeTab?.isModified) lastSavedContentRef.current = content;
          setSaveStatus(activeTab?.isModified ? 'unsaved' : 'saved');
          return;
      }
      const isUnsaved = content !== lastSavedContentRef.current;
      setSaveStatus(isUnsaved ? 'unsaved' : 'saved');
      setTabs(prev => prev.map(t =>
        t.id === activeTabId
          ? { ...t, isModified: isUnsaved }
          : t
      ));
    }
  }, [content, currentFileNode, activeTabId]);
  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0047] MainEditorApp.tsx ??autoSave
  // ?렞 @KICK  : 肄섑뀗痢?蹂寃?諛?autoSave ?쒖꽦????5珥??붾컮?댁뒪 ???뚯씪 ?먮룞 ???  // ?썳截?@GUARD : 肄섑뀗痢좉? 鍮꾩뼱?덇굅?? 誘몃━蹂닿린 紐⑤뱶媛 蹂寃?以묒씠嫄곕굹, 肄섑뀗痢좉? 蹂寃쎈릺吏 ?딆븯?쇰㈃ 嫄대꼫?; 5珥??붾컮?댁뒪 ?뺣━
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : saveFile, setSaveStatus, setTimeout, clearTimeout
  // ====================================================================
  useEffect(() => {
    // ?뙚 [?몄씠?꾪떚 媛??1]: ?먭퀬 蹂몃Ц??鍮꾩뼱?덇굅???곗씠?곌? 珥덇린?붾릺湲????곹깭?쇰㈃ 
    // ?쒖뒪???ㅼ뿼 ??μ쓣 ?먯쿇 李⑤떒?⑸땲??
    if (!content || content.trim() === "") {
      return;
    }

    // ?뙚 [?몄씠?꾪떚 媛??2]: ?좎?媛 酉?紐⑤뱶(遺꾪븷/?먮뵒???꾨━酉?瑜?蹂?섑븯??李곕굹???쒓컙?먮뒗 
    // 而댄룷?뚰듃 ?ㅼ뿼 ??대컢?대?濡??먮룞 ??μ쓣 ?앸왂?섍퀬 臾댁“嫄??湲곗떆?듬땲??
    if (typeof autoSave === 'number' && autoSave > 0 && currentFileNode && licenseStatus.isActivated) {
      if (content === lastSavedContentRef.current) return;

      setSaveStatus('saving');
      const timer = setTimeout(async () => {
        let saveContent = content;
        
        // [?쒖떇 ?먮룞 二쇱엯 ?⑥튂] ?먮룞 ????쒖뿉???꾩옱 ?쒖꽦?붾맂 ?꾨줈???뺣낫瑜?Frontmatter???먮룞 媛깆떊
        if (activeProfileId) {
          const profile = profiles?.find((p: any) => p.id === activeProfileId);
          const nextVal = updateCssProfileInFrontmatter(content, activeProfileId, profile?.name);
          if (nextVal !== content) {
            saveContent = nextVal;
            if (editorRef?.current) {
              const model = editorRef.current.getModel();
              if (model) {
                model.pushEditOperations(
                  [],
                  [{ range: model.getFullModelRange(), text: nextVal }],
                  () => null
                );
              }
            }
          }
        }

        const success = await saveFile(saveContent, currentFileNode);
        setSaveStatus(success ? 'saved' : 'unsaved');
        if (success) {
          lastSavedContentRef.current = saveContent;
          console.log(`?륅툘 [Onrivi Guard] ?먮룞 ????꾨즺 (${autoSave}珥?`);
          // ?먮룞 ??????꾩옱 ??쓽 isModified ?곹깭瑜?false濡?蹂듦뎄
          setTabs(prev => prev.map(t =>
            t.id === activeTabIdRef.current ? { ...t, isModified: false } : t
          ));
        }
      }, autoSave * 1000); // ?븩 ?ㅼ젙??珥?seconds) 湲곕컲 ?붾컮?댁뒪
      return () => clearTimeout(timer);
    }
  }, [content, autoSave, currentFileNode, saveFile, licenseStatus.isActivated, activeProfileId, profiles]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0048] MainEditorApp.tsx ??insertAtCursor
  // ?렞 @KICK  : 而ㅼ꽌 ?꾩튂 ?띿뒪???쎌엯??utilsEditorActions???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsEditorActions.insertAtCursor
  // ====================================================================
  const insertAtCursor = (text: string) => {
    utilsEditorActions.insertAtCursor(editorRef, lastSelectionRef, text);
  };

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0049] MainEditorApp.tsx ??findLineNumberByHeading
  // ?렞 @KICK  : ?쒕ぉ 以?寃?됱쓣 utilsEditorActions???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsEditorActions.findLineNumberByHeading
  // ====================================================================
  const findLineNumberByHeading = (content: string, heading: string): number => {
    return utilsEditorActions.findLineNumberByHeading(content, heading);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0050] MainEditorApp.tsx ??scrollToLine
  // ?렞 @KICK  : ?먮뵒???뱀젙 以꾨줈 ?ㅽ겕濡ㅼ쓣 utilsEditorActions???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsEditorActions.scrollToLine
  // ====================================================================
  const scrollToLine = (lineNumber: number) => {
    utilsEditorActions.scrollToLine(editorRef, lineNumber);
  };

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0051] MainEditorApp.tsx ??handlePreviewClick
  // ?렞 @KICK  : 誘몃━蹂닿린 ?대┃ ?? ?먮뵒?곕? ?쇱튂?섎뒗 以꾨줈 ?ㅽ겕濡? 誘몃━蹂닿린?먯꽌 以?媛뺤“
  // ?썳截?@GUARD : 以묒꺽 ?붿냼 泥섎━瑜??꾪빐 DOM closest [data-line] ?쒗쉶
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : scrollToLine, element.closest, classList.add/remove
  // ====================================================================
  const handlePreviewClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const lineEl = target.closest('[data-line]');
    if (lineEl) {
      const lineStr = lineEl.getAttribute('data-line');
      if (lineStr) {
        const lineNumber = parseInt(lineStr, 10);
        scrollToLine(lineNumber);

        if (previewRef.current) {
          const elements = Array.from(previewRef.current.querySelectorAll('[data-line]'));
          elements.forEach(element => element.classList.remove('preview-highlight-line'));
          lineEl.classList.add('preview-highlight-line'); // ?뮕 ?ъ옣??吏?? 留덉슦???대┃ ??誘몃━蹂닿린 ??留덊궧 ?섏씠?쇱씠?몄깋 蹂듦뎄
        }
      }
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0052] MainEditorApp.tsx ??insertBlockTag
  // ?렞 @KICK  : 釉붾줉 ?쒓렇 媛먯떥湲곕? utilsEditorActions???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsEditorActions.insertBlockTag
  // ====================================================================
  const insertBlockTag = (startTag: string, endTag: string, defaultText: string = "") => {
    utilsEditorActions.insertBlockTag(editorRef, startTag, endTag, defaultText);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0053] MainEditorApp.tsx ??wrapSelection
  // ?렞 @KICK  : ?좏깮 ?곸뿭 媛먯떥湲??湲곕? utilsEditorActions???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsEditorActions.wrapSelection
  // ====================================================================
  const wrapSelection = (before: string, after: string = before, defaultText: string = "") => {
    utilsEditorActions.wrapSelection(editorRef, lastSelectionRef, before, after, defaultText);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0054] MainEditorApp.tsx ??insertLink
  // ?렞 @KICK  : 而ㅼ꽌??留덊겕?ㅼ슫 留곹겕 ?쎌엯, URL ?뚮젅?댁뒪????띿뒪???먮룞 ?좏깮
  // ?썳截?@GUARD : ?꾩옱 ?좏깮??鍮꾩뼱?덉쑝硫?lastSelectionRef ?ъ슜; ?좏깮 ?띿뒪?몄? 鍮?寃쎌슦 紐⑤몢 泥섎━
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : editor.focus, editor.getSelection, editor.executeEdits, editor.setSelection
  // ====================================================================
  const insertLink = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    editor.focus();

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    if (selectedText) {
      const textToInsert = `[${selectedText}](https://)`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);

      const cursorColumn = selection.startColumn + 1 + selectedText.length + 2 + 8;

      editor.setSelection({
        startLineNumber: selection.startLineNumber,
        startColumn: cursorColumn,
        endLineNumber: selection.startLineNumber,
        endColumn: cursorColumn
      });
    } else {
      const textToInsert = `[?덊럹?댁?紐?(https://)`;
      const range = {
        startLineNumber: selection.startLineNumber,
        startColumn: selection.startColumn,
        endLineNumber: selection.endLineNumber,
        endColumn: selection.endColumn
      };
      editor.executeEdits("insertLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);

      const startColumn = selection.startColumn + 1;
      const endColumn = startColumn + 5;

      editor.setSelection({
        startLineNumber: selection.startLineNumber,
        startColumn: startColumn,
        endLineNumber: selection.startLineNumber,
        endColumn: endColumn
      });
    }
  };

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0057] MainEditorApp.tsx ??readFileText
  // ?렞 @KICK  : 釉뚮씪?곗? FileSystemHandle, 濡쒖뺄 electronAPI, VFS ?먮뒗 ?대씪?곕뱶 API?먯꽌 ?뚯씪 ?댁슜 ?쎄린
  // ?썳截?@GUARD : 寃쎈줈/?몃뱾 議댁옱 ?щ????곕씪 ?쒖꽦 紐⑤뱶 寃곗젙; ?ㅻ쪟瑜??뺤긽?곸쑝濡?泥섎━
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : node.handle.getFile, vfsReadFile, api.readFromPath, fetch
  // ====================================================================
  const readFileText = async (node: FileNode): Promise<string> => {
    let fileContent = '';
    let activeMode = workspaceType;
    if (workspaceType === 'browser') {
      activeMode = 'browser';
    } else if (node.path && !node.handle) {
      activeMode = 'local';
    } else if (node.handle && !node.path) {
      activeMode = 'browser';
    }

    if (activeMode === 'browser') {
      if (node.handle) {
        const file = await node.handle.getFile();
        fileContent = await file.text();
      } else if (node.path) {
        fileContent = vfsReadFile(node.path);
      }
    } else if (activeMode === 'local' && node.path) {
      const api = (window as any).electronAPI;
      if (api?.readFromPath) {
        try {
          const file = await api.readFromPath(node.path);
          if (file) {
            fileContent = file.content;
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        try {
          const res = await fetch(getApiUrl(`/api/file-content?path=${encodeURIComponent(node.path)}`));
          if (res.ok) {
            const data = await res.json();
            fileContent = data.content;
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
    return fileContent;
  };
  readFileTextRef.current = readFileText;

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0058] MainEditorApp.tsx ??extractHeadings
  // ?렞 @KICK  : 留덊겕?ㅼ슫 ?띿뒪?몃? ?뚯떛?섏뿬 ?쒕ぉ ?띿뒪??以?H1-H6) 異붿텧
  // ?썳截?@GUARD : ?쒕ぉ ?띿뒪?몄뿉???꾪뻾 # 臾몄옄 ?쒓굅
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  const extractHeadings = (text: string): string[] => {
    if (!text) return [];
    const headingLines = text.split('\n');
    const headings: string[] = [];
    const headingRegex = /^(#{1,6})\s+(.*)$/;
    headingLines.forEach(line => {
      const trimmed = line.trim();
      const match = trimmed.match(headingRegex);
      if (match) {
        const hText = match[2].replace(/#+\s*$/, '').trim(); // ?ㅼ뿉 遺숇뒗 遺덊븘?뷀븳 ???쒓굅
        if (hText) {
          headings.push(hText);
        }
      }
    });
    return headings;
  };

  // ====================================================================
  // ?뱤 [OMD-FILE-MainEditorApp-0059] MainEditorApp.tsx ??handleDocFileClick
  // ?렞 @KICK  : 臾몄꽌 留곹겕 ?좏깮湲곕? ?꾪빐 ?좏깮??臾몄꽌 ?뚯씪?먯꽌 ?쒕ぉ 濡쒕뱶
  // ?썳截?@GUARD : 濡쒕뵫 ?곹깭 ?ㅼ젙, ?ㅻ쪟 ???쒕ぉ 珥덇린??  // ?슚 @PATCH : None
  // ?뵕 @CALLS : readFileText, extractHeadings, setDocHeadings, setIsHeadingLoading
  // ====================================================================
  const handleDocFileClick = async (targetNode: FileNode) => {
    setSelectedDocNode(targetNode);
    setIsHeadingLoading(true);
    try {
      const text = await readFileText(targetNode);
      const headings = extractHeadings(text);
      setDocHeadings(headings);
    } catch (e) {
      console.error(e);
      setDocHeadings([]);
    } finally {
      setIsHeadingLoading(false);
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0060] MainEditorApp.tsx ??handleDocLinkSelect
  // ?렞 @KICK  : 而ㅼ꽌??[[relativePath#heading|text]] 臾몄꽌 媛?留곹겕 ?쎌엯
  // ?썳截?@GUARD : ?꾨즺 ??紐⑤뱺 ?좏깮湲??곹깭 珥덇린?? lastSelectionRef濡??대갚
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : getRelativePath, editor.focus, editor.getSelection, editor.executeEdits
  // ====================================================================
  const handleDocLinkSelect = (targetNode: FileNode, heading?: string) => {
    setShowDocLinkPicker(false);
    setDocLinkSearchText('');
    setSelectedDocNode(null);
    setDocHeadings([]);
    setDocHeadingSearchText('');

    if (!editorRef.current || !targetNode || !targetNode.path) return;
    const editor = editorRef.current;
    editor.focus();

    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();
    const selectedText = model.getValueInRange(selection);

    const targetPath = targetNode.path;
    const currentPath = currentFileNode?.path;
    const relativePath = getRelativePath(currentPath, targetPath);

    const headingText = heading ? `#${heading}` : '';
    const textToInsert = `[[${relativePath}${headingText}]]`;

    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    };
    editor.executeEdits("insertDocLink", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    editor.focus();
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0061] MainEditorApp.tsx ??parseHtmlTableToMarkdown
  // ?렞 @KICK  : HTML ?쒕? 留덊겕?ㅼ슫?쇰줈 蹂?섑븯???묒뾽??paste handlers???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsPasteHandlers.parseHtmlTableToMarkdown
  // ====================================================================
  const parseHtmlTableToMarkdown = (html: string) => {
    return utilsPasteHandlers.parseHtmlTableToMarkdown(html, showToast);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0062] MainEditorApp.tsx ??sanitizePastedText
  // ?렞 @KICK  : 遺숈뿬?ｊ린 ?띿뒪???뺤젣瑜?paste handlers???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsPasteHandlers.sanitizePastedText
  // ====================================================================
  const sanitizePastedText = (text: string, skipTsvConversion = false) => {
    return utilsPasteHandlers.sanitizePastedText(text, skipTsvConversion);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0063] MainEditorApp.tsx ??fixMarkdownTable
  // ?렞 @KICK  : 留덊겕?ㅼ슫 ???섏젙??paste handlers???꾩엫
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : utilsPasteHandlers.fixMarkdownTable
  // ====================================================================
  const fixMarkdownTable = (text: string) => {
    return utilsPasteHandlers.fixMarkdownTable(text);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0064] MainEditorApp.tsx ??resolveClipboardImage
  // ?렞 @KICK  : ?대┰蹂대뱶?먯꽌 ?대?吏 Blob/File 異붿텧 (items ??files ??navigator.clipboard ??
  // ?썳截?@GUARD : 紐⑤뱺 寃쎈줈 ?ㅽ뙣 ??null 諛섑솚, ?깃났 ??Blob 諛섑솚
  // ?뵕 @CALLS : ?놁쓬
  // ====================================================================
  const resolveClipboardImage = async (e: any, imageItem: any): Promise<Blob | null> => {
      // 鍮꾨룞湲?await) ?몄텧 ?댁쟾???숆린?곸쑝濡?釉뚮씪?곗? DataTransferItem 媛앹껜?먯꽌 File??利됱떆 異붿텧?댁빞 ?⑸땲??
      // ?щ＼ ?깆뿉?쒕뒗 await ?댄썑??getAsFile()???몄텧?섎㈃ 蹂댁븞??null??諛섑솚?⑸땲??
      let syncFile = null;
      let syncFiles = null;
      if (imageItem) {
        syncFile = imageItem.getAsFile();
      }
      if (e.clipboardData?.files?.length > 0) {
        syncFiles = e.clipboardData.files;
      }

      // 留뚯빟 ?숆린?곸쑝濡?異붿텧???뚯씪???좏슚?섎떎硫?利됱떆 諛섑솚
      // (?? ?щ＼ ?꾨줈誘몄뒪 踰꾧렇 ?깆쑝濡??ш린媛 0諛붿씠?몄씤 寃쎌슦???쒖쇅)
      if (syncFile && syncFile.size > 0) return syncFile;
      if (syncFiles && syncFiles.length > 0 && syncFiles[0].type.startsWith('image/') && syncFiles[0].size > 0) return syncFiles[0];

      // 0) [Electron] ?ㅼ씠?곕툕 ?대┰蹂대뱶 ?대?吏 ?쎄린 ?곗꽑 ?쒕룄 (?꾨줈誘몄뒪 踰꾧렇 ??0諛붿씠???고쉶)
      try {
        const api = typeof window !== 'undefined' ? (window as any).electronAPI : null;
        if (api && api.readClipboardImage) {
          const dataUrl = await api.readClipboardImage();
          if (dataUrl) {
            const res = await fetch(dataUrl);
            return await res.blob();
          }
        }
      } catch (err) {
        console.warn('[Clipboard] Native read fallback', err);
      }
  
      // 3) navigator.clipboard.read() (Async Clipboard API, 沅뚰븳 ?꾩슂)
      try {
        if (navigator.clipboard && typeof navigator.clipboard.read === 'function') {
          const clipboardItems = await navigator.clipboard.read();
          for (const ci of clipboardItems) {
            for (const type of ci.types) {
              if (type.startsWith('image/')) {
                return await ci.getType(type);
              }
            }
          }
        }
      } catch { }
      return null;
    };

    // ====================================================================
    // ?뮕 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ??handleEditorPaste
    // ?뱷 @KICK  : 遺숈뿬?ｊ린 ?대깽??泥섎━: ?대?吏 ?낅줈?? HTML ??蹂?? ?띿뒪???뺤젣
    // ?썳截?@GUARD : ?대?吏 遺숈뿬?ｊ린 ??湲곕낯 ?숈옉 李⑤떒, ?쇰컲 ?띿뒪???대갚 諛?HTML ???쒕룄
    // ?슚 @PATCH : None
    // ?봽 @CALLS : fetch, FileReader, parseHtmlTableToMarkdown, sanitizePastedText, fixMarkdownTable, insertAtCursor, updateContent, showToast
    // ====================================================================
    const handleEditorPaste = async (e: any) => {
    const items = e.clipboardData?.items;
    let hasText = false;
    let hasHtml = false;
    let imageItem = null;

    if (items) {
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) imageItem = items[i];
        if (items[i].type === 'text/plain') hasText = true;
        if (items[i].type === 'text/html') hasHtml = true;
      }
    }

    // ?뮕 [湲닿툒 ?섏젙] async ?⑥닔 ?뱀꽦??await瑜?留뚮굹硫??대깽??猷⑦봽媛 ?묐낫?섏뼱 釉뚮씪?곗?/紐⑤굹肄붿쓽 
    // 湲곕낯 遺숈뿬?ｊ린 ?숈옉???ㅽ뻾?섏뼱 踰꾨┰?덈떎. ?곕씪??await ?댁쟾???숆린?곸쑝濡??곗씠?곕? 寃?ы븯怨?
    // ?곕━媛 泥섎━????곸씠硫?e.preventDefault()瑜?利됱떆 ?몄텧?댁빞 ?⑸땲??

    const htmlData = hasHtml ? e.clipboardData.getData('text/html') : '';
    const hasTable = htmlData && htmlData.includes('<table');
    const textData = hasText ? e.clipboardData.getData('text/plain') : '';
    
    let processedText = textData;
    let textChanged = false;
    if (textData) {
      processedText = sanitizePastedText(textData);
      if (processedText.includes('|')) {
        processedText = fixMarkdownTable(processedText);
      }
      if (processedText !== textData) {
        textChanged = true;
      }
    }

    const hasImageFile = !imageItem && e.clipboardData?.files?.length > 0 && e.clipboardData.files[0].type.startsWith('image/');

    // ??곸씠 ?섎굹?쇰룄 ?덉쑝硫?利됱떆 湲곕낯 ?숈옉 李⑤떒
    if (imageItem || hasImageFile || hasTable || textChanged) {
      e.preventDefault();
    }

    // 1. ?대?吏 泥섎━
    const resolvedBlob = await resolveClipboardImage(e, imageItem);
    if (resolvedBlob) {
      handlePasteImageFile(resolvedBlob);
      return;
    }

    // 2. HTML Table 泥섎━
    if (hasTable) {
      const mdTable = parseHtmlTableToMarkdown(htmlData);
      if (mdTable) {
        insertAtCursor(mdTable);
        if (editorRef.current) {
          updateContent(editorRef.current.getValue(), true);
        }
        showToast("?????곗씠?곌? 留덊겕?ㅼ슫?쇰줈 ?꾨꼍?섍쾶 蹂?섎릺?덉뒿?덈떎.", "success");
        return;
      }
    }

    // 3. ?쇰컲 ?띿뒪??泥섎━ (?뺤젣媛 ?꾩슂??寃쎌슦?먮쭔)
    if (textChanged) {
      insertAtCursor(processedText);
      if (editorRef.current) {
        updateContent(editorRef.current.getValue(), true);
      }
      showToast("遺숈뿬?ｌ? ?띿뒪?멸? ?먮룞?쇰줈 ?뺤젣(援먯젙)?섏뿀?듬땲??", "success");
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ??handlePasteImageFile
  // ?렞 @KICK  : ?대?吏 Blob/File??諛쏆븘 濡쒖뺄(?곗뒪?ы깙) ?먮뒗 R2(??????????먮뵒??而ㅼ꽌 ?꾩튂???쎌엯
  // ?썳截?@GUARD : FileReader onload/onerror 泥섎━, ?곗뒪?ы깙/??遺꾧린
  // ?슚 @PATCH : 2026-07-06 ?대?吏 遺숈뿬?ｊ린 ???곗뒪?ы깙 濡쒖뺄 ?좎??μ씠 ?꾨땶 R2 ?좎??μ쑝濡?濡쒖쭅 ?쒖꽌 諛섏쟾
  // ?뵕 @CALLS : fetch, FileReader, showToast
  // ====================================================================
  const handlePasteImageFile = async (fileOrBlob: Blob) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      if (!base64Data) {
        showToast('?대?吏 ?곗씠?곕? ?쎌쓣 ???놁뒿?덈떎.', 'error');
        return;
      }
      try {
        const base64DataClean = base64Data.split(',')[1] || base64Data;
        const api = (window as any).electronAPI;
        
        let fileName = `image_${Date.now()}.png`;
        try {
          const binaryString = atob(base64DataClean);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
              bytes[i] = binaryString.charCodeAt(i);
          }
          const hashBuffer = await crypto.subtle.digest('SHA-256', bytes);
          const hashArray = Array.from(new Uint8Array(hashBuffer));
          const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 12);
          fileName = `img_${hashHex}.png`;
        } catch (e) {
          console.warn('?댁떆 ?앹꽦 ?ㅽ뙣, 湲곕낯 ?쒓컙 湲곕컲 ?대쫫 ?ъ슜', e);
        }
        
        let targetFolder = currentFilePath || rootFolderRef.current?.name || '';
        if (resourceFolderRef.current) {
          targetFolder = resourceFolderRef.current + '\\media';
        }

        if (api) {
          // ?뼢截??곗뒪?ы깙 (Electron): ?곗꽑?곸쑝濡?R2 ?낅줈?쒕? ?쒕룄?섍퀬, ?ㅽ뙣 ??濡쒖뺄 assets/ ?????          await insertWithR2Fallback(base64DataClean, targetFolder, fileName);
        } else {
          // ?뙋 ??釉뚮씪?곗? (SaaS)
          if (resourceFolderHandle) {
            try {
              const mediaDir = await resourceFolderHandle.getDirectoryHandle('media', { create: true });
              const fileHandle = await mediaDir.getFileHandle(fileName, { create: true });
              const writable = await fileHandle.createWritable();
              await writable.write(fileOrBlob);
              await writable.close();
              insertImageMarkdown(`/media/${fileName}`);
              showToast('濡쒖뺄 怨듯넻 ?대뜑(media)???대?吏媛 ??λ릺?덉뒿?덈떎.', 'success');
              return;
            } catch (err) {
              console.warn('[Paste Image] Failed to save to resource folder:', err);
              // ?ㅽ뙣?섎㈃ ?꾨옒 R2 ?낅줈?쒕줈 ?대갚
            }
          }
          await webUploadImage(base64Data);
        }
      } catch (err) {
        console.error('[Paste Image Error]', err);
        showToast('?대┰蹂대뱶 ?대?吏 泥섎━ 以??ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.', 'error');
      }
    };
    reader.onerror = () => {
      showToast('?대?吏 ?뚯씪???쎈뒗???ㅽ뙣?덉뒿?덈떎.', 'error');
    };
    reader.readAsDataURL(fileOrBlob);
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0066] MainEditorApp.tsx ??insertWithR2Fallback
  // ?렞 @KICK  : ?곗뒪?ы깙: ?곗꽑 R2 ?대씪?곕뱶 ?낅줈???쒕룄, ?ㅽ뙣 ??濡쒖뺄 ?뚯씪 ?쒖뒪??assets/)??fallback ???  // ?썳截?@GUARD : R2 ?ㅽ뙣 ??api.saveImage ?몄텧
  // ?슚 @PATCH : 2026-07-06 ?곗꽑 R2 ?대씪?곕뱶 ?낅줈???쒕룄 ???ㅽ뙣 ??api.saveImage濡?濡쒖뺄 assets????ν븯?꾨줉 ?ъ꽕怨?  // ?뵕 @CALLS : fetch, api.saveImage, showToast
  // ====================================================================
  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0031] MainEditorApp ??insertWithLocalSave
  // ?렞 @KICK  : ?곗뒪?ы깙 ?대?吏 遺숈뿬?ｊ린 ??臾댁“嫄?濡쒖뺄(resourceFolder) ???  // ?썳截?@GUARD : api.saveImage ?ㅽ뙣 ??toast ?덈궡
  // ?슚 @PATCH : 2026-07-30 ??R2 ?낅줈???쒓굅, 臾댁“嫄?濡쒖뺄 ??μ쑝濡??⑥닚??  // ?뵕 @CALLS : api.saveImage, showToast
  // ====================================================================
  const insertWithR2Fallback = async (base64DataClean: string, targetFolder: string, fileName: string) => {
    const api = (window as any).electronAPI;
    if (!api) return;

    const saveResult = await api.saveImage(targetFolder, base64DataClean, fileName);
    if (saveResult && saveResult.success) {
      const finalPath = saveResult.mediaPath
        ? saveResult.mediaPath
        : `media://local/serve?url=${encodeURIComponent(saveResult.absolutePath)}`;
      insertImageMarkdown(finalPath);
      showToast('?대?吏媛 濡쒖뺄 ?대뜑????λ릺?덉뒿?덈떎.', 'success');
    } else {
      showToast('?대?吏 濡쒖뺄 ??μ뿉 ?ㅽ뙣?덉뒿?덈떎.', 'error');
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0067] MainEditorApp.tsx ??webUploadImage
  // ?렞 @KICK  : ??釉뚮씪?곗?: API瑜??듯빐 R2(?먮뒗 dev 濡쒖뺄)???대?吏 ?낅줈?????먮뵒???쎌엯
  // ?썳截?@GUARD : dev/production ?붾뱶?ъ씤??遺꾧린, JWT ?몄쬆
  // ?뵕 @CALLS : fetch, showToast
  // ====================================================================
  const webUploadImage = async (base64Data: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const isDev = process.env.NODE_ENV === 'development';
      const uploadEndpoint = isDev ? getApiUrl('/api/upload-pasted-image') : '/api/upload-image';
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const response = await fetch(uploadEndpoint, {
        method: 'POST', headers,
        body: JSON.stringify({ base64Data, targetFolder: currentFilePath || rootFolderRef.current?.name || '' }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.relativePath) {
          insertImageMarkdown(data.relativePath);
          showToast(isDev ? '媛쒕컻 ?섍꼍: 濡쒖뺄 assets ?대뜑????λ릺?덉뒿?덈떎.' : '???섍꼍: ?대씪?곕뱶 ?쒕쾭(R2)???깃났?곸쑝濡??낅줈?쒕릺?덉뒿?덈떎.', 'success');
        } else {
          showToast('?대?吏 ?낅줈???ㅽ뙣: ' + (data.error || '?????녿뒗 ?ㅻ쪟'), 'error');
        }
      } else {
        showToast(`?쒕쾭 ?ㅻ쪟 諛쒖깮 (${response.status})`, 'error');
      }
    } catch (err) {
      console.error('[Web Upload Error]', err);
      showToast('?대?吏 ?낅줈???꾩넚 以??ㅽ듃?뚰겕 ?ㅻ쪟媛 諛쒖깮?덉뒿?덈떎.', 'error');
    }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0068] MainEditorApp.tsx ??insertImageMarkdown
  // ?렞 @KICK  : ?먮뵒??而ㅼ꽌 ?꾩튂??留덊겕?ㅼ슫 ?대?吏 臾몃쾿 ?쎌엯
  // ?썳截?@GUARD : editorRef.current null 泥댄겕, readOnly ?고쉶
  // ?뵕 @CALLS : editor.executeEdits, updateContent
  // ====================================================================
  const insertImageMarkdown = (path: string) => {
    if (!editorRef.current) {
      showToast('?먮뵒?곕? 李얠쓣 ???놁뼱 ?대?吏瑜??쎌엯?????놁뒿?덈떎.', 'error');
      return;
    }
    const editor = editorRef.current;
    const selection = editor.getSelection();
    const range = {
      startLineNumber: selection.startLineNumber,
      startColumn: selection.startColumn,
      endLineNumber: selection.endLineNumber,
      endColumn: selection.endColumn
    };
    const textToInsert = `![?대?吏](${path})`;
    editor.executeEdits("pasteImage", [{ range, text: textToInsert, forceMoveMarkers: true }]);
    try {
      const newValue = editor.getValue();
      updateContent(newValue, true);
    } catch { }
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0065] MainEditorApp.tsx ??applyLinePrefix
  // ?렞 @KICK  : ?좏깮??以꾩뿉 ?쒖꽌 紐⑸줉/湲癒몃━ 湲고샇/?몄슜援?泥댄겕由ъ뒪???묐몢???곸슜
  // ?썳截?@GUARD : ?댁쟾 鍮꾩뼱?덉? ?딆? 以?理쒕? 10以??먯꽌 ?곗냽 ?쒖꽌 踰덊샇 怨꾩궛; 以묒꺽 ?몄슜援?泥섎━
  // ?슚 @PATCH : 援щЦ 媛뺤“ ?덈줈怨좎묠???꾪빐 ?몄쭛 ??forceTokenization
  // ?뵕 @CALLS : editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout
  // ====================================================================
  const applyLinePrefix = (prefixType: 'orderedList' | 'list' | 'quote' | 'check') => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();

    const startLine = selection.startLineNumber;
    const endLine = selection.endLineNumber;

    const edits = [];
    let counter = 1;
    if (prefixType === 'orderedList') {
      for (let j = startLine - 1; j > 0; j--) {
        const prevLine = model.getLineContent(j);
        if (prevLine.trim() === '') {
          break;
        }
        const match = prevLine.match(/^(\s*)(\d+)\.\s/);
        if (match) {
          counter = parseInt(match[2], 10) + 1;
          break;
        }
        if (startLine - j > 10) break;
      }
    }

    for (let i = startLine; i <= endLine; i++) {
      const lineContent = model.getLineContent(i);
      const match = lineContent.match(/^(\s*)(>+\s*)?((?:- \[[ xX]\]|[-*+]|\d+\.)\s+)?(.*)/);

      if (match) {
        const indent = match[1] || '';
        const quotes = match[2] || '';
        const listSymbol = match[3] || '';
        const text = match[4] || '';

        let newQuotes = quotes;
        let newListSymbol = listSymbol;

        if (prefixType === 'quote') {
          if (quotes) {
            newQuotes = '>' + quotes;
          } else {
            newQuotes = '> ';
          }
        } else {
          let targetListSymbol = '';
          if (prefixType === 'orderedList') {
            targetListSymbol = `${counter}. `;
            counter++;
          } else if (prefixType === 'list') {
            targetListSymbol = '- ';
          } else if (prefixType === 'check') {
            targetListSymbol = '- [ ] ';
          }

          if (listSymbol) {
            newListSymbol = targetListSymbol;
          } else {
            newListSymbol = targetListSymbol;
          }
        }

        const textStartIndex = lineContent.length - text.length;
        const newPrefix = `${indent}${newQuotes}${newListSymbol}`;

        edits.push({
          range: new (window as any).monaco.Range(i, 1, i, textStartIndex + 1),
          text: newPrefix,
          forceMoveMarkers: true
        });
      } else {
        let fallbackPrefix = '';
        if (prefixType === 'orderedList') {
          fallbackPrefix = `${counter}. `;
          counter++;
        } else if (prefixType === 'list') {
          fallbackPrefix = '- ';
        } else if (prefixType === 'quote') {
          fallbackPrefix = '> ';
        } else if (prefixType === 'check') {
          fallbackPrefix = '- [ ] ';
        }

        edits.push({
          range: new (window as any).monaco.Range(i, 1, i, 1),
          text: fallbackPrefix,
          forceMoveMarkers: true
        });
      }
    }

    editor.executeEdits("applyPrefix", edits);
      setTimeout(() => editor.getAction('autoRenumberList')?.run(), 10);

    // [WBS SYNC-02] 二쇱엯 吏곹썑 援щЦ 媛뺤“? 諛곌꼍 ?ㅽ??쇱씠 利됱떆 ?붾㈃???뚮뜑留곷릺?꾨줉 Monaco 紐⑤뜽??媛뺤젣 ?좏겙???섎룞 寃⑸컻
    try {
      const model = editor.getModel();
      if (model && typeof model.forceTokenization === 'function') {
        for (let i = startLine; i <= endLine; i++) {
          model.forceTokenization(i);
        }
      }
      editor.layout();
    } catch (_) { }

    editor.focus();
  };

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0066] MainEditorApp.tsx ??removePrefix
  // ?렞 @KICK  : ?좏깮 ?곸뿭?먯꽌 留덊겕?ㅼ슫 ?쒖떇 ?쒓렇 ?쒓굅: 援듦쾶, 湲곗슱?? 痍⑥냼?? 肄붾뱶, 留곹겕, ?쒕ぉ, 紐⑸줉
  // ?썳截?@GUARD : 鍮??좏깮 ?곸뿭???꾩껜 以꾨줈 ?뺤옣 泥섎━; ?뺢퇋??湲곕컲 ?뺣━濡??좏뻾 怨듬갚 蹂댁〈
  // ?슚 @PATCH : 援щЦ 媛뺤“ ?덈줈怨좎묠???꾪빐 ?몄쭛 ??forceTokenization
  // ?뵕 @CALLS : editor.getSelection, editor.executeEdits, model.forceTokenization, editor.layout
  // ====================================================================
  const removePrefix = () => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if ((!selection || selection.isEmpty()) && lastSelectionRef.current && !lastSelectionRef.current.isEmpty()) {
      selection = lastSelectionRef.current;
    }
    if (!selection) return;
    const model = editor.getModel();

    let rangeToProcess = selection;
    if (selection.isEmpty()) {
      const cursorLine = selection.positionLineNumber;
      const lineLen = model.getLineLength(cursorLine);
      rangeToProcess = new (window as any).monaco.Range(cursorLine, 1, cursorLine, lineLen + 1);
    }

    const selectedText = model.getValueInRange(rangeToProcess);
    let cleanedText = selectedText;

    cleanedText = cleanedText.replace(/<\/?(u|mark|span|b|i|strong|em|ins|del)[^>]*>/gi, '');
    cleanedText = cleanedText.replace(/(\*\*|__)(.*?)\1/g, '$2');
    cleanedText = cleanedText.replace(/(\*|_)(.*?)\1/g, '$2');
    cleanedText = cleanedText.replace(/~~(.*?)~~/g, '$1');
    cleanedText = cleanedText.replace(/`(.*?)`/g, '$1');
    cleanedText = cleanedText.replace(/!\[(.*?)\]\(.*?\)/g, '$1');
    cleanedText = cleanedText.replace(/\[(.*?)\]\(.*?\)/g, '$1');

    const lines = cleanedText.split('\n');
    const processedLines = lines.map((line: string) => {
      const leadingSpaces = line.match(/^(\s*)/)?.[1] || "";
      const trimmed = line.trim();

      const match = trimmed.match(/^(#{1,6}|[-*+]\s+\[[ xX]\]|[-*+]|\d+\.|>+)(?:\s+(.*))?$/);
      if (match) {
        return leadingSpaces + (match[2] || "");
      }
      return line;
    });

    cleanedText = processedLines.join('\n');

    setTimeout(() => editor.getAction('autoRenumberList')?.run(), 10);
      editor.executeEdits("removeMarkdownTags", [
      {
        range: rangeToProcess,
        text: cleanedText,
        forceMoveMarkers: true
      }
    ]);

    // [WBS SYNC-02] 二쇱엯 吏곹썑 援щЦ 媛뺤“? 諛곌꼍 ?ㅽ??쇱씠 利됱떆 ?붾㈃???뚮뜑留곷릺?꾨줉 Monaco 紐⑤뜽??媛뺤젣 ?좏겙???섎룞 寃⑸컻
    try {
      const model = editor.getModel();
      if (model && typeof model.forceTokenization === 'function') {
        const startLine = rangeToProcess.startLineNumber;
        const endLine = rangeToProcess.endLineNumber;
        for (let i = startLine; i <= endLine; i++) {
          model.forceTokenization(i);
        }
      }
      editor.layout();
    } catch (_) { }

    editor.focus();
  };

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0067] MainEditorApp.tsx ??processedContent_lineMap
  // ?렞 @KICK  : 誘몃━蹂닿린瑜??꾪빐 留덊겕?ㅼ슫 肄섑뀗痢좊? ?꾩쿂由ы븯怨??ㅽ겕濡??숆린?붾? ?꾪븳 ?쇱씤 留ㅽ븨 ?앹꽦
  // ?썳截?@GUARD : None
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : preprocessMarkdownForPreview
  // ====================================================================

  const { processedContent, lineMap } = useMemo(() => {
    const res = preprocessMarkdownForPreview(content);
    return {
      processedContent: res.text,
      lineMap: res.lineMap
    };
  }, [content]);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0068] MainEditorApp.tsx ??dynamicCssString
  // ?렞 @KICK  : ?쒖꽦 CSS ?꾨줈?꾩뿉????댄룷洹몃옒?? 肄붾뱶 釉붾줉, ?? 泥댄겕諛뺤뒪, 援щ텇?? ?ㅽ겕紐⑤뱶 ?ъ젙?섎? ?ы븿???숈쟻 CSS ?앹꽦
  // ?썳截?@GUARD : 湲곕낯 ?꾨줈?꾩? 鍮?臾몄옄??諛섑솚; blockquote, hr, color??????ㅽ겕紐⑤뱶 ?ъ젙?? h2-h6 font-size 嫄대꼫?(?먮룞 怨꾩궛)
  // ?슚 @PATCH : 諛뺤뒪 以묒꺽 ?꾪떚?⑺듃 諛⑹?瑜??꾪븳 codeBlock 以묒꺽 border/background ?щ챸 ?ъ젙??  // ?뵕 @CALLS : None
  // ====================================================================
  const dynamicCssString = useMemo(() => {
    if (activeProfileId === 'default') return '';
    const prof = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
    const ps = prof.pageStyle;

    const profileBg = ps.backgroundColor || '#ffffff';
    const bg = profileBg;
    // Set a very dark gray/black color instead of 'inherit' for much better contrast on white backgrounds
    const fg = '#1a1a1a';

    let css = `
.custom-preview-container {
  background: ${bg} !important;
  color: ${fg} !important;
  font-family: ${ps.fontFamily} !important;
  font-size: ${ps.fontSize} !important;
  line-height: ${ps.lineHeight} !important;
  letter-spacing: ${ps.letterSpacing} !important;
  -webkit-font-smoothing: subpixel-antialiased !important;
  -moz-osx-font-smoothing: auto !important;
  text-rendering: optimizeLegibility !important;
}
.custom-preview-container p,
.custom-preview-container li,
.custom-preview-container blockquote {
  font-size: inherit !important;
  line-height: inherit !important;
}
/* ??媛꾧꺽 (Tab Size) ??pre/code?먯꽌 ??臾몄옄媛 ?쒖떆????*/
.custom-preview-container pre,
.custom-preview-container code {
  tab-size: ${ps.tabSize || '2'} !important;
  -moz-tab-size: ${ps.tabSize || '2'} !important;
}
`;
    /* H2~H6 ?먮룞 ?ш린 怨꾩궛 (headingSizeOffset 湲곕컲) */
    const h1SizeVal = (prof.rules.h1 && prof.rules.h1['font-size']) || '28px';
    const h1Size = parseFloat(h1SizeVal) || 28;
    const offset = parseFloat(ps.headingSizeOffset) || 4;
    for (let level = 2; level <= 6; level++) {
      const calcSize = Math.max(10, h1Size - (level - 1) * offset);
      css += `.custom-preview-container h${level} {\n  font-size: ${calcSize}px !important;\n}\n`;
    }
    Object.entries(prof.rules).forEach(([tag, ruleObj]) => {
      /* h2~h6??font-size??headingSizeOffset ?먮룞 怨꾩궛?쇰줈 ?泥?*/
      const skipFontSize = ['h2', 'h3', 'h4', 'h5', 'h6'].includes(tag);
      const entries = Object.entries(ruleObj).map(([prop, v]) => {
        // ?뮕 [OMD-PATCH] 援щ쾭???좎? ?꾨줈?꾩뿉 ??λ맂 keep-all??遺덈윭?吏硫댁꽌 嫄곕? 怨듬갚 踰꾧렇瑜??좊컻?섎뒗 寃껋쓣 留됯린 ?꾪빐 媛뺤젣 留덉씠洹몃젅?댁뀡
        if (prop === 'word-break' && v === 'keep-all') return [prop, 'break-all'];
        return [prop, v];
      }).filter(([prop, v]) => {
        if (v === '') return false;
        if (skipFontSize && prop === 'font-size') return false;
        return true;
      }).sort((a, b) => a[0].localeCompare(b[0]));
      if (entries.length === 0) return;

      if (tag === 'codeBlockTitle') {
        const bgColor = ruleObj['background-color'];
        const textColor = ruleObj['color'];
        if (bgColor) {
          css += `.custom-preview-container .codeblock-header {\n  background-color: ${bgColor} !important;\n}\n`;
        }
        if (textColor) {
          css += `.custom-preview-container .codeblock-header-text {\n  color: ${textColor} !important;\n}\n`;
        }
        return;
      }

      if (tag === 'codeBlock') {
        const bgColor = ruleObj['background-color'];
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const padding = ruleObj['padding'];
        const borderRadius = ruleObj['border-radius'];

        if (bgColor) {
          css += `.custom-preview-container .codeblock-area {\n  background-color: ${bgColor} !important;\n}\n`;
        }
        if (borderRadius) {
          css += `.custom-preview-container .codeblock-area {\n  border-radius: ${borderRadius} !important;\n}\n`;
        }
        if (color) {
          css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  color: ${color} !important;\n}\n`;
        }
        if (fontSize) {
          css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  font-size: ${fontSize} !important;\n}\n`;
        }
        if (padding) {
          css += `.custom-preview-container .codeblock-area pre {\n  padding: ${padding} !important;\n}\n`;
        }

        // ?뮕 ?꾨━酉?紐⑤뱶?먯꽌 以묒꺽???뚮몢由ъ? 諛곌꼍??諛뺤뒪 ?덉쓽 諛뺤뒪 ?꾩긽) ?먯쿇 李⑤떒
        css += `.custom-preview-container .codeblock-area pre, .custom-preview-container .codeblock-area pre code {\n  border: none !important;\n  background: transparent !important;\n}\n`;

        // ?뮕 肄붾뱶釉붾줉 ?꾩슜 紐낆떆??媛濡??ㅽ겕濡ㅻ컮 (?뚮쭏??湲???됱긽??諛뷀깢?쇰줈 ?쒖링 ??諛앷퀬 ?먭퍖寃?
        const trackColor = color ? `color-mix(in srgb, ${color} 15%, transparent)` : 'rgba(200, 200, 200, 0.1)';
        const thumbColor = color ? `color-mix(in srgb, ${color} 60%, transparent)` : 'rgba(200, 200, 200, 0.6)';
        const thumbHoverColor = color ? `color-mix(in srgb, ${color} 85%, transparent)` : 'rgba(200, 200, 200, 0.8)';

        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar {\n  height: 10px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-track {\n  background: ${trackColor} !important;\n  border-radius: 5px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-thumb {\n  background: ${thumbColor} !important;\n  border-radius: 5px !important;\n}\n`;
        css += `.custom-preview-container .codeblock-area .custom-scrollbar::-webkit-scrollbar-thumb:hover {\n  background: ${thumbHoverColor} !important;\n}\n`;
        return;
      }

      if (tag === 'math') {
        const layoutProps = ['text-align', 'margin-top', 'margin-bottom'];
        
        // 1. 釉붾줉 ?덉씠?꾩썐(?붿뒪?뚮젅???섏떇) ?띿꽦
        css += `.custom-preview-container .katex-display {\n`;
        entries.forEach(([prop, val]) => {
          if (layoutProps.includes(prop)) {
            css += `  ${prop}: ${val} !important;\n`;
          }
        });
        css += `}\n`;
        
        // 1-1. ?섏떇??<p>濡?媛먯떥???덈뒗 寃쎌슦 <p>??留덉쭊??媛뺤젣 ?뚭굅 (?섏떇??留덉쭊留??⑥쟾???곸슜)
        css += `.custom-preview-container p:has(> .katex-display) {\n`;
        css += `  margin: 0 !important;\n`;
        css += `}\n`;

        // 1-2. ?대? .katex ?붿냼?먮룄 ?뺣젹 諛⑹떇??媛뺤젣 二쇱엯?섏뿬 globals.css??left 媛뺤젣???뚰뙆
        if (entries.some(([prop]) => prop === 'text-align')) {
          const alignVal = entries.find(([prop]) => prop === 'text-align')[1];
          css += `.custom-preview-container .katex-display {\n`;
          css += `  display: flex !important;\n`;
          if (alignVal === 'center') {
            css += `  justify-content: center !important;\n`;
          } else if (alignVal === 'right') {
            css += `  justify-content: flex-end !important;\n`;
          } else {
            css += `  justify-content: flex-start !important;\n`;
          }
          css += `}\n`;
          css += `.custom-preview-container .katex-display > .katex {\n`;
          css += `  text-align: ${alignVal} !important;\n`;
          css += `}\n`;
        }
        
        // 2. ?몃씪??諛??띿뒪???띿꽦 (?됱긽, ?ш린 ??
        css += `.custom-preview-container .katex-display .katex, .custom-preview-container :not(.katex-display) > .katex {\n`;
        entries.forEach(([prop, val]) => {
          if (!layoutProps.includes(prop)) {
            css += `  ${prop}: ${val} !important;\n`;
          }
        });
        css += `}\n`;
        return;
      }

      if (tag === 'footnote') {
        const color = ruleObj['color'];
        const fontSize = ruleObj['font-size'];
        const lineHeight = ruleObj['line-height'];
        const marginTop = ruleObj['margin-top'];
        const fontWeight = ruleObj['font-weight'];

        if (marginTop) {
          css += `.custom-preview-container .footnotes {\n  margin-top: ${marginTop} !important;\n}\n`;
        }
        if (color) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  color: ${color} !important;\n}\n`;
        }
        if (fontSize) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  font-size: ${fontSize} !important;\n}\n`;
        }
        if (lineHeight) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  line-height: ${lineHeight} !important;\n}\n`;
        }
        if (fontWeight) {
          css += `.custom-preview-container .footnotes, .custom-preview-container .footnotes p, .custom-preview-container .footnotes li, .custom-preview-container .footnotes a {\n  font-weight: ${fontWeight} !important;\n}\n`;
        }
        return;
      }

      const selector = tag === 'taskList' ? '.task-list-item' :
        tag === 'code' ? ':not(pre) > code' :
          tag === 'map' ? 'iframe[src*="map"]' :
            tag === 'video' ? 'video, iframe[src*="youtube"], iframe[src*="vimeo"], a[href*="youtube.com"] img, a[href*="youtu.be"] img' : tag;
            
      const isMediaTag = tag === 'img' || tag === 'video' || tag === 'map';
      const sizeProps = ['width', 'height', 'max-width', 'max-height'];
      css += `.custom-preview-container ${selector} {\n`;
      entries.forEach(([prop, val]) => {
        const skipImportant = isMediaTag && sizeProps.includes(prop);
        css += `  ${prop}: ${val}${skipImportant ? '' : ' !important'};\n`;
      });
      css += `}\n`;
    });

    // ?㎞ 援ъ“?쒖뼱: ??湲???ш린 ?숈쟻 ?곸냽 (?ㅼ젙?섏? ?딆? 寃쎌슦 ?섏씠吏 湲곕낯 ?ш린瑜??곕쫫)
    const tableHasFontSize = prof.rules.table && prof.rules.table['font-size'];
    if (!tableHasFontSize) {
      css += `
.custom-preview-container th,
.custom-preview-container td {
  font-size: inherit !important;
}
`;
    }

    // ?뱤 ???뺢탳??蹂댁젙: ?몃줈 以묒븰 ?뺣젹 諛??⑥뼱 ?⑥쐞 以꾨컮轅?keep-all) 媛뺤젣 ?곸슜
    css += `
.custom-preview-container th,
.custom-preview-container td {
  vertical-align: middle !important;
  word-break: keep-all !important;
}
`;

    // ?㎞ 援ъ“?쒖뼱: 援щ텇??洹쒖튃 (HR) ?숈쟻 ?몄젥??    if (prof.hrStructure) {
      const hrRules = prof.rules.hr || {};
      const hrStyle = hrRules['border-top-style'] || hrRules['border-style'] || prof.hrStructure.borderTopStyle || 'solid';
      const hrWidth = hrRules['border-top-width'] || hrRules['border-width'] || prof.hrStructure.borderTopWidth || '1px';
      const hrMargin = hrRules['margin-top'] || hrRules['margin-bottom'] || hrRules['margin'] || prof.hrStructure.marginTopBottom || '32px';
      const hrLen = hrRules['width'] || prof.hrStructure.lineWidth || '100%';
      const hrColor = hrRules['border-top-color'] || hrRules['border-color'] || hrRules['color'] || '#e5e7eb';
      css += `
.custom-preview-container hr {
  border-left: none !important;
  border-right: none !important;
  border-bottom: none !important;
  border-top-width: ${hrWidth} !important;
  border-top-style: ${hrStyle} !important;
  border-top-color: ${hrColor} !important;
  margin-top: ${hrMargin} !important;
  margin-bottom: ${hrMargin} !important;
  width: ${hrLen} !important;
  ${hrLen !== '100%' ? 'margin-left: auto !important;\n  margin-right: auto !important;' : ''}
}
`;
    }

    // ?㎞ 援ъ“?쒖뼱: 泥댄겕諛뺤뒪 洹쒖튃 (Task List) ?숈쟻 ?몄젥??    if (prof.checkboxStructure) {
      const cbSize = prof.checkboxStructure.boxSize || '16px';
      const cbGap = prof.checkboxStructure.textGap || '10px';
      const cbEffect = prof.checkboxStructure.checkedEffect || 'none';
      const cbColor = prof.checkboxStructure.color || 'currentColor';
      css += `
.custom-preview-container input[type="checkbox"] {
  appearance: none !important;
  -webkit-appearance: none !important;
  width: ${cbSize} !important;
  height: ${cbSize} !important;
  margin-right: ${cbGap} !important;
  border: 1px solid ${cbColor} !important;
  border-radius: 3px !important;
  background-color: transparent !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  position: relative !important;
  vertical-align: middle !important;
  flex-shrink: 0 !important;
}

.custom-preview-container input[type="checkbox"]:checked {
  background-color: ${cbColor} !important;
  border-color: ${cbColor} !important;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3E%3C/svg%3E") !important;
  background-size: 100% 100% !important;
  background-position: center !important;
  background-repeat: no-repeat !important;
}
`;
      if (cbEffect === 'line-through-and-dim') {
        css += `
.custom-preview-container .task-list-item:has(input:checked) {
  text-decoration: line-through !important;
  opacity: 0.5 !important;
}
`;
      } else if (cbEffect === 'dim-only') {
        css += `
.custom-preview-container .task-list-item:has(input:checked) {
  opacity: 0.5 !important;
}
`;
      }
    }



    // ?뮕 留덉빱 ?됱긽: ul/ol ?띿뒪???됱긽???곸냽諛쏅룄濡?媛뺤젣 (Tailwind 湲곕낯?됱긽 臾댁떆)
    css += `
.custom-preview-container ul li::marker,
.custom-preview-container ol li::marker {
  color: inherit !important;
}
`;

    // Legacy CSS page-break logic removed in favor of injectPageBreakMarkers.

    return css;
  }, [profiles, activeProfileId]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0069] MainEditorApp.tsx ??quickWrap
  // ?렞 @KICK  : ?좏깮 ?곸뿭 ?먮뒗 ?꾩옱 以꾩쓣 ?쒕ぉ/?몄슜援?肄붾뱶 ?쒖떇?쇰줈 鍮좊Ⅴ寃?媛먯뙃?덈떎
  // ?썳截?@GUARD : ?좏깮 ?곸뿭???놁쑝硫??꾩껜 以??먮룞 ?좏깮; Monaco 媛???뺤씤
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : wrapSelection, applyLinePrefix, insertBlockTag, editor.focus
  // ====================================================================
  const quickWrap = (format: 'h1' | 'h2' | 'h3' | 'quote' | 'code') => {
    if (!editorRef.current) return;
    const editor = editorRef.current;
    let selection = editor.getSelection();
    if (!selection) return;
    const model = editor.getModel();
    if (!model) return;
    const monaco = (window as any).monaco;
    if (!monaco) return;

    // No selection ??auto-select entire current line
    if (selection.isEmpty()) {
      const pos = editor.getPosition();
      if (!pos) return;
      const lineNum = pos.lineNumber;
      const lineContent = model.getLineContent(lineNum);
      editor.setSelection(new monaco.Selection(
        lineNum, 1,
        lineNum, lineContent.length + 1
      ));
      selection = editor.getSelection();
      if (!selection || selection.isEmpty()) return;
    }

    switch (format) {
      case 'h1': wrapSelection('# ', '', ''); break;
      case 'h2': wrapSelection('## ', '', ''); break;
      case 'h3': wrapSelection('### ', '', ''); break;
      case 'quote': applyLinePrefix('quote'); break;
      case 'code': insertBlockTag('```', '```', ''); break;
    }
    editor.focus();
  };

  const handlers = useEditorHandlers({
    editorRef,
    contentRef,
    currentFileNameRef,
    currentFileNodeRef,
    workspaceTypeRef,
    rootFolderRef,
    lastSavedContentRef,
    currentFileParentHandleRef,
    profiles,
    activeProfileId,
    isDarkMode,
    dynamicCssString,
    setSaveStatus,
    setCurrentFileName,
    setCurrentFileNode,
    setRootFolder,
    setWorkspaceType,
    setIsSidebarOpen,
    setIsExportModalOpen,
    setIsYoutubeModalOpen,
    setIsMapModalOpen,
    setIsTableModalOpen,
    setIsFormulaModalOpen,
    setIsSearchOpen,
    setIsLicenseModalOpen,
    setIsSettingsModalOpen,
    setIsImageModalOpen,
    setIsReferenceModalOpen,
    setEditingImageInfo,
    setSettingsModalInitialTab,
    setFontSize,
    setHelpTitle,
    setHelpContent,
    setIsHelpModalOpen,
    setFloatingToolbar,
    setPromptConfig,
    showToast,
    refreshFileList,
    updateContent,
    wrapSelection,
    insertAtCursor,
    applyLinePrefix,
    removePrefix,
    insertLink,
    quickWrap,
    insertBlockTag,
    setShowDocLinkPicker,
    sanitizePastedText,
    isComposingRef,
    previewRef,
    createNewTab,
    switchTab,
    setTabs,
    activeTabIdRef,
    licenseStatusRef
  });

  handlersRef.current = handlers;

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0070] MainEditorApp.tsx ??dispatchCommand
  // ?렞 @KICK  : ?먮뵒???ъ빱??媛?쒖? ?④퍡 EditorCommandType???몃뱾??硫붿꽌?쒕줈 ?쇱슦?낇븯???듯빀 紐낅졊 ?붿뒪?⑥쿂
  // ?썳截?@GUARD : 釉뚮씪?곗? ?ъ빱???먯떎 諛⑹?瑜??꾪븳 entry?먯꽌 editor.focus(); 紐⑤떖 紐낅졊 ??50ms 鍮꾨룞湲?forceTokenization; previewMode !== 'preview' 媛?쒕? ?댁슜???대낫?닿린 ?쒗븳
  // ?슚 @PATCH : **2026-06-19** ???대낫?닿린 紐⑤뱶 媛???⑥튂: previewMode媛 'preview'(誘몃━蹂닿린 ?꾩슜) 紐⑤뱶媛 ?꾨땺 ???대낫?닿린 紐낅졊(PRINT, EXPORT_*)???몃━嫄곕릺??寃쎌슦 寃쎄퀬 ?좎뒪?몃? ?꾩슦怨?紐낅졊 ?ㅽ뻾??李⑤떒?섎룄濡?蹂댁젙; 臾몄옄 寃뱀묠 ?섏젙???꾪븳 50ms setTimeout ?좏겙??+ ?덉씠?꾩썐 (WBS SYNC-02)
  // ?뵕 @CALLS : handlers.newFile/save/saveAs/exit/print/exportHTML/exportEPUB/exportPNG/openExport, handlers.zoomIn/zoomOut/undo/redo/find/replace/globalSearch/settings/about/help/license, handlers.toggleFloatingToolbar/cleanDoc/copyAll, handlers.bold/italic/inlineCode/underline/strikethrough/h1-h6/hr/orderedList/list/quote/check/removePrefix, handlers.link/doclink/image/video/now/map/table/quickTable/insertTableRow/deleteTableRow/code/chart/math, handlers.quickWrap, selectRootFolder, setPreviewMode, setIsToolbarOpen, setIsSidebarOpen, setThemePalette, setIsDarkMode
  // ====================================================================
  const dispatchCommand = useCallback((type: EditorCommandType, payload?: any) => {
    // [WBS SYNC-01] 紐낅졊???ㅽ뻾 珥덉엯 ?④퀎??諛섎뱶??editor.focus()瑜?媛뺤젣 寃⑸컻?섏뿬 釉뚮씪?곗? ?ъ빱??類뤾? 諛⑹? 諛??ъ???理쒖슦???뺣낫
    let editorPosition = null;
    if (editorRef.current) {
      const editor = editorRef.current;
      editor.focus();
      editorPosition = editor.getPosition();
    }

    // ?뵏 [?쒗븳 ?ъ슜???곌린 諛⑹뼱 媛?? 湲곕뒫 ?쒓굅??
    // 1. ?먮뵒???띿뒪??鍮꾩“??紐낅졊??(?곹깭 ?쒖뼱 諛??뚯씪 ?낆텧???꾩엫)
    switch (type) {
      // ?뚯씪 愿??      case 'NEW_FILE': return;
      case 'OPEN_FILE': (async () => {
        if (typeof (window as any).showOpenFilePicker !== 'function') {
          showToast('??釉뚮씪?곗???濡쒖뺄 ?뚯씪 ?닿린瑜?吏?먰븯吏 ?딆뒿?덈떎.', 'error');
          return;
        }
        try {
          const [fileHandle] = await (window as any).showOpenFilePicker({
            multiple: false,
            types: [{
              description: 'Markdown Files',
              accept: { 'text/markdown': ['.md', '.markdown'], 'text/plain': ['.md'] }
            }]
          });
          const file = await fileHandle.getFile();
          const text = await file.text();
          updateContent(text);
          setCurrentFileName(file.name);
          setCurrentFileNode({ name: file.name, kind: 'file', handle: fileHandle });
          lastSavedContentRef.current = text;
          setSaveStatus('saved');
          refreshFileList();
          showToast(`'${file.name}' ?뚯씪???댁뿀?듬땲??`, 'success');
        } catch (e: any) {
          if (e.name !== 'AbortError') showToast(`?뚯씪 ?닿린 ?ㅽ뙣: ${e.message}`, 'error');
        }
      })(); return;
      case 'OPEN_WORKSPACE': selectRootFolder('local', null); return;
      case 'SAVE': handlers.save(); return;
      case 'SAVE_AS': handlers.saveAs(); return;
      case 'EXIT': handlers.exit(); return;

      // ?대낫?닿린 愿??      case 'PRINT':
      case 'EXPORT_HTML':
      case 'EXPORT_EPUB':
      case 'EXPORT_PNG':
      case 'OPEN_EXPORT': {
        // ?뵏 [?대낫?닿린 諛⑹뼱 媛?? 湲곕뒫 ?쒓굅??        if (previewMode !== 'preview') {
          showToast('?대낫?닿린??誘몃━蹂닿린 ?꾩슜 紐⑤뱶?먯꽌留?媛?ν빀?덈떎. (?곷떒 ?꾧뎄 > 誘몃━蹂닿린 ?좏깮)', 'warning');
          return;
        }
        if (type === 'PRINT') handlers.print();
        else if (type === 'EXPORT_HTML') handlers.exportHTML();
        else if (type === 'EXPORT_EPUB') handlers.exportEPUB();
        else if (type === 'EXPORT_PNG') handlers.exportPNG();
        else if (type === 'OPEN_EXPORT') handlers.openExport();
        return;
      }

      // 蹂닿린/?쒖뼱 愿??      case 'ZOOM_IN': handlers.zoomIn(); return;
      case 'ZOOM_OUT': handlers.zoomOut(); return;
      case 'UNDO': handlers.undo(); return;
      case 'REDO': handlers.redo(); return;
      case 'FIND': handlers.find(); return;
      case 'REPLACE': handlers.replace(); return;
      case 'GLOBAL_SEARCH': handlers.globalSearch(); return;
      case 'SETTINGS':
        setIsSettingsModalOpen(true);
        return;
      case 'SETTINGS_SHORTCUTS':
        setSettingsModalInitialTab('shortcuts');
        setIsSettingsModalOpen(true);
        return;
      case 'TOGGLE_CSS_STYLE':
        setIsStyleModalOpen(true);
        return;
      case 'ADD_REFERENCE':
        setIsReferenceModalOpen(true);
        return;
      case 'ABOUT': handlers.about(); return;
      case 'HELP': handlers.help(); return;
      case 'LICENSE': handlers.license(); return;
      case 'TOGGLE_FLOATING_TOOLBAR': {
        if (!activeTabId || previewMode === 'preview') {
          showToast('?몄쭛 紐⑤뱶?먯꽌 臾몄꽌媛 ?대젮?덉쓣 ?뚮쭔 ?ъ슜 媛?ν빀?덈떎.', 'warning');
          return;
        }
        handlers.toggleFloatingToolbar(); 
        return;
      }
      case 'AI_DRAFT': {
        if (!geminiApiKey) {
          showToast('?ㅼ젙?먯꽌 Gemini API ?ㅻ? 癒쇱? ?깅줉?댁＜?몄슂.', 'warning');
          setIsSettingsModalOpen(true);
          return;
        }
        if (!activeTabId || previewMode === 'preview') {
          showToast('?몄쭛 紐⑤뱶?먯꽌 臾몄꽌媛 ?대젮?덉쓣 ?뚮쭔 ?ъ슜 媛?ν빀?덈떎.', 'warning');
          return;
        }
        setAiDraftInitialMode('draft');
        setIsAIDraftModalOpen(true); 
        return;
      }
      case 'OPEN_AI_WRITER': {
        if (!geminiApiKey) {
          showToast('?ㅼ젙?먯꽌 Gemini API ?ㅻ? 癒쇱? ?깅줉?댁＜?몄슂.', 'warning');
          setIsSettingsModalOpen(true);
          return;
        }
        if (!activeTabId || previewMode === 'preview') {
          showToast('?몄쭛 紐⑤뱶?먯꽌 臾몄꽌媛 ?대젮?덉쓣 ?뚮쭔 ?ъ슜 媛?ν빀?덈떎.', 'warning');
          return;
        }
        const editor = editorRef.current;
        const selection = editor ? editor.getSelection() : null;
        const model = editor ? editor.getModel() : null;
        let selectedText = '';
        let fullText = '';
        if (editor && model) {
          fullText = model.getValue();
          if (selection && !selection.isEmpty()) {
            selectedText = model.getValueInRange(selection);
          }
        }
        setAiEditorContext({ selectedText, fullText });
        setAiDraftInitialMode('editorial');
        setIsAIDraftModalOpen(true);
        return;
      }
      case 'AUTO_RENUMBER':
        console.log('[DEBUG] AUTO_RENUMBER dispatched! Triggering autoRenumberList...');
        setTimeout(() => editorRef.current?.getAction('autoRenumberList')?.run(), 100);
        break;
      case 'SLASH_COMMAND': {
        if (!activeTabId || previewMode === 'preview') {
          showToast('?몄쭛 紐⑤뱶?먯꽌 臾몄꽌媛 ?대젮?덉쓣 ?뚮쭔 ?ъ슜 媛?ν빀?덈떎.', 'warning');
          return;
        }
        const editor = editorRef.current;
        if (editor) {
          editor.focus();
          const position = editor.getPosition();
          if (position) {
            editor.executeEdits('slash-trigger', [
              {
                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
                text: '/',
                forceMoveMarkers: true
              }
            ]);
            setTimeout(() => {
              editor.trigger('keyboard', 'editor.action.triggerSuggest', {});
            }, 50);
          }
        }
        return;
      }
      case 'CLEAN_DOC': handlers.cleanDoc(); return;
      case 'COPY_ALL': handlers.copyAll(); return;
      // ?렞 TOOLBAR_ITEMS '?명꽣' 洹몃９ ?좉? 紐낅졊??(handlers???놁쑝誘濡?吏곸젒 ?곹깭 蹂??
      case 'TOGGLE_TOOLBAR': setIsToolbarOpen(prev => !prev); return;
      case 'TOGGLE_SIDEBAR': setIsSidebarOpen(prev => !prev); return;
      case 'TOGGLE_MODE':
        setPreviewMode(prev => {
          if (prev === 'css-style') return prev;
          if (prev === 'edit') return 'both';
          if (prev === 'both') return 'preview';
          return 'edit';
        });
        return;
      case 'TOGGLE_THEME':
        // ?ъ슜???붿껌?쇰줈 ?뚮쭏 蹂寃?湲곕뒫 鍮꾪솢?깊솕
        return;
      /*
       * TOGGLE_CSS_STYLE ??CssStyleForm ?⑤꼸 ?좉? (Ctrl+Shift+S)
       *
       * - css-style 紐⑤뱶: 醫뚯륫 50%媛 CssStyleForm(?쒖떇 ?뺤쓽), ?곗륫 50%媛 誘몃━蹂닿린
       * - ?ㅼ떆 ?꾨Ⅴ硫?'both'(?몄쭛+誘몃━蹂닿린 遺꾪븷)濡?蹂듦?
       */
      // TOGGLE_CSS_STYLE is merged above with SETTINGS
      case 'MERGE':
        setIsMergeMode(true);
        return;
    }

    // 2. ?먮뵒??蹂몃Ц ?쒖떇 議곗옉 紐낅졊??(?ъ빱??媛??媛뺤젣 異붿쟻)
    if (!editorRef.current) return;
    const editor = editorRef.current;

    // [WBS SYNC-01] ?대? 珥덉엯遺?먯꽌 editor.focus() 諛?getPosition()??理쒖슦???뺣낫?섏??쇰?濡?以묐났 ?몄텧 ?쒓굅
    const MODAL_COMMANDS: EditorCommandType[] = ['IMAGE', 'VIDEO', 'YOUTUBE', 'MAP', 'TABLE', 'LATEX', 'MATH', 'LINK'];

    const selection = editor.getSelection();

    const model = editor.getModel();
    if (!model || !selection) return;

    switch (type) {
      // ?쒖떇 愿??      case 'BOLD': handlers.bold(); break;
      case 'FOOTNOTE': handlers.footnote(); break;
      case 'ORGANIZE_FOOTNOTES': handlers.organizeFootnotes(); break;
      case 'ITALIC': handlers.italic(); break;
      case 'INLINE_CODE': handlers.inlineCode(); break;
      case 'UNDERLINE': handlers.underline(); break;
      case 'STRIKETHROUGH': handlers.strikethrough(); break;
      case 'H1': handlers.h1(); break;
      case 'H2': handlers.h2(); break;
      case 'H3': handlers.h3(); break;
      case 'H4': handlers.h4(); break;
      case 'H5': handlers.h5(); break;
      case 'H6': handlers.h6(); break;
      case 'HR': handlers.hr(); break;
      case 'ORDERED_LIST': handlers.orderedList(); break;
      case 'LIST': handlers.list(); break;
      case 'QUOTE': handlers.quote(); break;
      case 'CHECK':
      case 'CHECKLIST': handlers.check(); break;
      case 'ERASER':
      case 'REMOVE_PREFIX': handlers.removePrefix(); break;

      // ?쎌엯 愿??      case 'LINK': handlers.link(); break;
      case 'DOCLINK': handlers.doclink(); break;
      case 'IMAGE': handlers.image(); break;
      case 'CITE': setIsCitationModalOpen(true); break;
      case 'YOUTUBE':
      case 'VIDEO': {
        const selText = model.getValueInRange(selection);
        const mdLink = selText.match(/^\[([^\]]*)\]\(([^)]*)\)$/);
        if (mdLink) {
          setYoutubeInitialUrl(mdLink[2]);
          youtubeEditRangeRef.current = new (window as any).monaco.Range(
            selection.startLineNumber, selection.startColumn,
            selection.endLineNumber, selection.endColumn
          );
        } else {
          setYoutubeInitialUrl(null);
          youtubeEditRangeRef.current = null;
        }
        handlers.video();
        break;
      }
      case 'NOW': handlers.now(); break;
      case 'MAP': handlers.map(); break;
      case 'TABLE': handlers.table(); break;
      case 'QUICK_TABLE': handlers.quickTable(); break;
      case 'INSERT_TABLE_ROW': handlers.insertTableRow(); break;
      case 'DELETE_TABLE_ROW': handlers.deleteTableRow(); break;
      case 'CODE':
      case 'CODE_BLOCK': handlers.code(); break;
      case 'CHART': handlers.chart(); break;
      case 'LATEX':
      case 'MATH': handlers.math(); break;

      // ?????섑븨 (Quick Transform)
      case 'WRAP_H1': handlers.quickWrap('h1'); break;
      case 'WRAP_H2': handlers.quickWrap('h2'); break;
      case 'WRAP_H3': handlers.quickWrap('h3'); break;
      case 'WRAP_QUOTE': handlers.quickWrap('quote'); break;
      case 'WRAP_CODE': handlers.quickWrap('code'); break;

      default:
        showToast(`?????녿뒗 紐낅졊?? ${type}`, 'warning');
        break;
    }

    // ?썳截?紐⑤떖???앹뾽?섎뒗 紐낅졊?대뒗 ?먮뵒?곕줈 ?ъ빱?ㅻ? 類뤾린吏 ?딅룄濡??덉쇅 泥섎━
    // (IMAGE, VIDEO, MAP, TABLE, LATEX, MATH, LINK 怨꾩뿴? 紐⑤떖 ?낅젰 ?꾨뱶媛 ?ъ빱?ㅻ? 媛?몄빞 ??
    // [WBS SYNC-02] 50ms 鍮꾨룞湲?吏?곗쓣 ?먯뼱 ?먮뵒??踰꾪띁???꾩쟾 湲곕줉 ???좏겙 由ы봽?덉떆 諛??덉씠?꾩썐 ?ъ쟻?⑹쑝濡?湲??寃뱀묠 ?꾨꼍 ?닿껐
    setTimeout(() => {
      try {
        if (editorRef.current) {
          const editor = editorRef.current;
          const model = editor.getModel();
          const selection = editor.getSelection();
          if (model && selection) {
            const startLine = selection.startLineNumber;
            const endLine = selection.endLineNumber;
            for (let i = startLine; i <= endLine; i++) {
              if (model && typeof model.forceTokenization === 'function') {
                model.forceTokenization(i);
              }
            }
            editor.layout();
          }
        }
      } catch (_) { }
    }, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handlers]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0071] MainEditorApp.tsx ??mapIdToCommandType
  // ?렞 @KICK  : ?대컮 ??ぉ??camelCase ID瑜?紐낆떆???ъ젙???뚯씠釉붾줈 EditorCommandType UPPER_SNAKE_CASE??留ㅽ븨
  // ?썳截?@GUARD : 遺덉씪移?ID?????紐낆떆??留ㅽ븨(divider?묱R, clear?뭃EMOVE_PREFIX, calendar?묿OW); ?먮룞 UPPER_SNAKE ?대갚
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  const mapIdToCommandType = useCallback((id: string): EditorCommandType => {
    // ?뵎 紐낆떆??留ㅽ븨 ?뚯씠釉? TOOLBAR_ITEMS id ??EditorCommandType
    // (id ??commandType ????ぉ?ㅼ쓣 ?섎룞?쇰줈 ?뺤쓽?섏뿬 ?깊겕 蹂댁옣)
    const EXPLICIT_MAP: Record<string, EditorCommandType> = {
      bold: 'BOLD',
      italic: 'ITALIC',
      inlineCode: 'INLINE_CODE',
      underline: 'UNDERLINE',
      strikethrough: 'STRIKETHROUGH',
      h1: 'H1', h2: 'H2', h3: 'H3', h4: 'H4', h5: 'H5', h6: 'H6',
      divider: 'HR',        // id??divider?댁?留?而ㅻ㎤?쒕뒗 HR
      orderedList: 'ORDERED_LIST',
      list: 'LIST',
      quote: 'QUOTE',
      checklist: 'CHECKLIST',
      clear: 'REMOVE_PREFIX',  // id??clear?댁?留?而ㅻ㎤?쒕뒗 REMOVE_PREFIX
      cleanDoc: 'CLEAN_DOC',
      link: 'LINK',
      taglink: 'DOCLINK',
      image: 'IMAGE',
      video: 'VIDEO',
      vidio: 'VIDEO',
      youtube: 'YOUTUBE',
      calendar: 'NOW',
      now: 'NOW',
      map: 'MAP',
      chart: 'CHART',
      codeblock: 'CODE_BLOCK',
      math: 'MATH',
      styleSettings: 'TOGGLE_CSS_STYLE',
      table: 'TABLE',
      footnote: 'FOOTNOTE',
      citation: 'CITE',
      quickTable: 'QUICK_TABLE',
      insertTableRow: 'INSERT_TABLE_ROW',
      deleteTableRow: 'DELETE_TABLE_ROW',
      toggleFloatingToolbar: 'TOGGLE_FLOATING_TOOLBAR',
      toggleToolbar: 'TOGGLE_TOOLBAR',
      toggleSidebar: 'TOGGLE_SIDEBAR',
      toggleMode: 'TOGGLE_MODE',
      toggleTheme: 'TOGGLE_THEME',
      'wrap-h1': 'WRAP_H1',
      aiHelp: 'AI_DRAFT',
      'wrap-h2': 'WRAP_H2',
      'wrap-h3': 'WRAP_H3',
      'wrap-quote': 'WRAP_QUOTE',
      'wrap-code': 'WRAP_CODE',
    };
    if (EXPLICIT_MAP[id]) return EXPLICIT_MAP[id];
    // 紐낆떆??留ㅽ븨???놁쑝硫?camelCase ??UPPER_SNAKE_CASE ?먮룞 蹂?섏쑝濡??대갚
    const snake = id.replace(/([A-Z])/g, '_$1').toUpperCase();
    return snake as EditorCommandType;
  }, []);

  // ====================================================================
  // ?뱤 [OMD-EDIT-MainEditorApp-0072] MainEditorApp.tsx ??hotkeyRegistration
  // ?렞 @KICK  : 紐⑤뱺 TOOLBAR_ITEMS??????ъ슜???뺤쓽 ?⑥텞??Ctrl+S/Ctrl+Shift+S ?ы븿)濡?Monaco ?먮뵒???≪뀡 ?깅줉
  // ?썳截?@GUARD : ?ъ떎?????댁쟾 disposables ?댁젣; ?ㅻ컮?몃뵫 臾몄옄?댁쓣 Monaco KeyMod/KeyCode濡??뚯떛
  // ?슚 @PATCH : None
  // ?뵕 @CALLS : TOOLBAR_ITEMS.forEach, editor.addAction, monaco.editor.defineTheme, monaco.editor.setTheme, updateDecorations, handleEditorPaste
  // ====================================================================
  useEffect(() => {
    if (!editorRef.current || !(window as any).monaco) return;
    const editor = editorRef.current;
    const monaco = (window as any).monaco;

    hotkeyDisposablesRef.current.forEach(d => d.dispose());
    hotkeyDisposablesRef.current = [];

    // 湲濡쒕쾶 trigger-custom-action 紐낅졊?대? ?꾪븳 理쒖떊 ?붿뒪?⑥쿂 媛깆떊
    if (typeof window !== 'undefined') {
      (window as any).dispatchEditorCommand = (id: string) => {
        if (id === 'AI_MODAL') {
          // ?뮕 [AI API 媛?? API Key媛 ?ㅼ젙?섏뼱 ?덉? ?딆쑝硫??묐룞?섏? ?딄퀬 寃쎄퀬 ???ㅼ젙李쎌쓣 耳?땲??
          if (!geminiApiKey) {
            showToast("AI 湲곕뒫???ъ슜?섎젮硫??ㅼ젙(?깅땲諛뷀??먯꽌 Gemini API Key瑜??깅줉??二쇱꽭??", "warning");
            dispatchCommand('SETTINGS');
            return;
          }

          const editor = editorRef.current;
          const selection = editor ? editor.getSelection() : null;
          const model = editor ? editor.getModel() : null;
          let selectedText = '';
          if (editor && model && selection && !selection.isEmpty()) {
            selectedText = model.getValueInRange(selection);
          }

          generationIdRef.current++;
          setAiPreviewState(prev => ({
            ...prev,
            isOpen: true,
            promptInput: '',
            streamingText: '',
            isFinished: false,
            isStarted: false,
            action: 'expand',
            originalRange: selection,
            originalText: selectedText,
            targetScope: selectedText ? 'selection' : 'none'
          }));
          return;
        }
        const cmdType = mapIdToCommandType(id);
        dispatchCommand(cmdType);
      };
    }

    const parseKeybinding = (keyStr: string) => {
      if (!keyStr) return 0;
      let binding = 0;
      const parts = keyStr.split('+').map(p => p.trim().toUpperCase());
      if (parts.includes('CTRL') || parts.includes('CTRLCMD')) binding |= monaco.KeyMod.CtrlCmd;
      if (parts.includes('SHIFT')) binding |= monaco.KeyMod.Shift;
      if (parts.includes('ALT')) binding |= monaco.KeyMod.Alt;
      if (parts.includes('WIN') || parts.includes('META')) binding |= monaco.KeyMod.WinCtrl;

      const keyPart = parts[parts.length - 1];
      if (keyPart.length === 1 && keyPart >= 'A' && keyPart <= 'Z') {
        binding |= monaco.KeyCode[`Key${keyPart}`];
      } else if (keyPart >= '0' && keyPart <= '9') {
        binding |= monaco.KeyCode[`Digit${keyPart}`];
      } else if (keyPart === '-') {
        binding |= monaco.KeyCode.Minus;
      } else if (keyPart === '=') {
        binding |= monaco.KeyCode.Equal;
      } else if (keyPart === '\\') {
        binding |= monaco.KeyCode.Backslash;
      } else if (keyPart === '[') {
        binding |= monaco.KeyCode.BracketLeft;
      } else if (keyPart === ']') {
        binding |= monaco.KeyCode.BracketRight;
      } else if (keyPart === ';') {
        binding |= monaco.KeyCode.Semicolon;
      } else if (keyPart === "'") {
        binding |= monaco.KeyCode.Quote;
      } else if (keyPart === ',') {
        binding |= monaco.KeyCode.Comma;
      } else if (keyPart === '.') {
        binding |= monaco.KeyCode.Period;
      } else if (keyPart === '/') {
        binding |= monaco.KeyCode.Slash;
      } else if (keyPart === 'SPACE') {
        binding |= monaco.KeyCode.Space;
      } else if (keyPart === 'ENTER') {
        binding |= monaco.KeyCode.Enter;
      } else if (keyPart === 'DELETE') {
        binding |= monaco.KeyCode.Delete;
      } else if (keyPart === 'BACKSPACE') {
        binding |= monaco.KeyCode.Backspace;
      } else if (keyPart === 'TAB') {
        binding |= monaco.KeyCode.Tab;
      } else if (keyPart === 'ESCAPE' || keyPart === 'ESC') {
        binding |= monaco.KeyCode.Escape;
      } else if (keyPart.length >= 2 && keyPart.startsWith('F')) {
        const fNum = parseInt(keyPart.substring(1));
        if (fNum >= 1 && fNum <= 12) {
          binding |= monaco.KeyCode[`F${fNum}`];
        }
      }
      return binding;
    };

    // ?? 湲곗〈 Object.entries(handlers) 諛⑹떇 ??TOOLBAR_ITEMS 湲곗? ?쒗쉶濡??꾪솚
    // ?댁쑀: handlers 硫붿냼?쒕챸怨?TOOLBAR_ITEMS??id媛 遺덉씪移섑븯硫??? checklist vs check, divider vs hr)
    //       ?쇰? ?⑥텞?ㅺ? ?깅줉?섏? ?딆븘 ?대컮쨌?щ옒?쑣룸떒異뺥궎 3???ъ씠??媛?닔쨌湲곕뒫 ?깊겕媛 源⑥쭚
    TOOLBAR_ITEMS.forEach(item => {
      const kbStr = customHotkeys[item.id];
      const kb = kbStr ? parseKeybinding(kbStr) : 0;

      const disposable = editor.addAction({
        id: `custom-action-${item.id}`,
        label: `${item.name} (${item.group})`,
        keybindings: kb !== 0 ? [kb] : [],
        run: () => {
          // ?? handlers 吏곸젒 ?몄텧 ???dispatchCommand ?⑤갑???뚯씠?꾨씪?몄쑝濡??쇱썝??          const cmdType = mapIdToCommandType(item.id);
          dispatchCommand(cmdType);
        }
      });
      hotkeyDisposablesRef.current.push(disposable);
    });

    // ?뮕 Monaco Editor ?몄뒪?댁뒪??Ctrl+S 諛?Ctrl+Shift+S ????≪뀡 諛붿씤??    const saveAction = editor.addAction({
      id: 'custom-action-save',
      label: '???(Save)',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      run: () => {
        dispatchCommand('SAVE');
      }
    });
    hotkeyDisposablesRef.current.push(saveAction);

    const saveAsAction = editor.addAction({
      id: 'custom-action-save-as',
      label: '?ㅻⅨ ?대쫫?쇰줈 ???(Save As)',
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyS],
      run: () => {
        dispatchCommand('SAVE_AS');
      }
    });
    hotkeyDisposablesRef.current.push(saveAsAction);
  }, [customHotkeys, isEditorReady, dispatchCommand, mapIdToCommandType, geminiApiKey, showToast]);

  // ====================================================================
  // ?뱤 [OMD-EDIT-0037] MainEditorApp.tsx ??globalKeydownHandler
  // ?렞 @KICK  : ?꾩뿭 ?ㅻ낫???⑥텞??泥섎━湲? S/O??釉뚮씪?곗? 湲곕낯 ?숈옉 李⑤떒, Escape濡??뚮줈???대컮/?쒓렇 ?좏깮湲?泥섎━, ?ъ슜???뺤쓽 ?⑥텞???쇱슦??  // ?썳截?@GUARD : capture ?④퀎 由ъ뒪?? Monaco ?몃? ???붿냼 ?대깽??臾댁떆; IME 229 keyCode 蹂듦뎄; ?먮뵒???ъ빱??泥댄겕 ??湲濡쒕쾶 ?꾩슜 ?⑥텞??媛먯?; Shift+諛⑺뼢??議곌린 諛섑솚(Monaco ?좏깮 蹂댄샇)
  // ?슚 @PATCH : Ctrl+S/O 釉뚮씪?곗? 湲곕낯 ????닿린 ?ㅼ씠?쇰줈洹?preventDefault 泥섎━; ?쒓? ?낅젰???꾪븳 keyCode 229 IME 議고빀 蹂듦뎄
  //           | Shift+諛⑺뼢?ㅻ? capture ?④퀎?먯꽌 媛濡쒖콈吏 ?딅룄濡?early return 異붽? | 2026-06-15 | IME+諛⑺뼢??異⑸룎濡?Monaco ?띿뒪???좏깮 踰꾧렇 ?닿껐
  // ?뵕 @CALLS : dispatchCommand, mapIdToCommandType, setFloatingToolbar
  // ====================================================================
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ?뮕 [鍮꾪몴以 ?대깽??媛?? getModifierState 硫붿꽌?쒓? ?녿뒗 媛??鍮꾪몴以 ?대깽???좎엯 李⑤떒
      if (typeof e.getModifierState !== 'function') {
        return;
      }

      // ?뮕 [Shift+諛⑺뼢??媛?? capture:true ?④퀎?먯꽌 Shift+諛⑺뼢?ㅻ? ?덈? 媛濡쒖콈吏 ?딆쓬
      // Monaco ?먮뵒?곗쓽 cursorLeftSelect/cursorRightSelect ??湲곕낯 ?띿뒪???좏깮 ?숈옉 蹂댄샇
      // ?뱁엳 IME(?쒓?) ?곹깭?먯꽌 keyCode 229 蹂듦뎄 濡쒖쭅怨?異⑸룎?섏뿬 ?좏깮???딄린??踰꾧렇 諛⑹?
      if (e.shiftKey && ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        return;
      }

      // ?뮕 ?ъ빱?ㅺ? 紐⑤굹肄??먮뵒???몃????쇰컲 HTML ?낅젰 ?붿냼(input, select, textarea)??寃쎌슦
      // 湲濡쒕쾶 ?⑥텞??媛濡쒖콈湲??숈옉??李⑤떒?섍퀬 釉뚮씪?곗? 湲곕낯 ?낅젰???꾩쟻?쇰줈 ?덉슜?⑸땲??
      const target = e.target as HTMLElement;
      if (target) {
        const isFormElement = target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA';
        const isInsideMonaco = target.closest('.monaco-editor') !== null;
        if (isFormElement && !isInsideMonaco) {
          return;
        }
      }

      // Escape: ?뚮줈???대컮 ?④? (?먮뵒???ъ빱??臾닿?)
      if (e.key === 'Escape') {
        if (floatingToolbar.visible) {
          e.preventDefault();
          e.stopPropagation();
          setFloatingToolbar(prev => ({ ...prev, visible: false }));
          return;
        }
      }

      const isCtrl = e.ctrlKey || e.metaKey;
      const isShift = e.shiftKey;
      const isAlt = e.altKey;

      // ?뮕 [IME-02] 釉뚮씪?곗? ?섍꼍?먯꽌 Ctrl+S ??????뱁럹?댁? ???HTML) ?ㅼ씠?쇰줈洹멸? 媛뺤젣 ?몄텧?섎뒗 ?대깽?몃? 李⑤떒?섍퀬 
      // ?곕━ ?먮뵒??怨좎쑀?????而ㅻ㎤?쒕? ?ㅽ뻾?섎룄濡??먯쿇 李⑤떒?⑸땲?? (?먮뵒???ъ빱???щ?? 愿怨꾩뾾???꾩뿭 諛⑹뼱)
      if (isCtrl) {
        const keyUpper = e.key.toUpperCase();
        if (keyUpper === 'S' && isShift) {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SAVE_AS');
          return;
        }
        if (keyUpper === 'S' && !isShift) {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SAVE');
          return;
        }
      }

      // ?뮕 [Ctrl+O 李⑤떒] ?뚯씪 ?닿린 湲곕뒫???쒓굅?섏뿀?쇰?濡? 釉뚮씪?곗? 湲곕낯 ?뚯씪 ?닿린 ?ㅼ씠?쇰줈洹?Ctrl+O)媛 ?섑??섏? ?딅룄濡??먯쿇 李⑤떒?⑸땲??
      if (isCtrl && !isAlt && !isShift) {
        const keyUpper = e.key.toUpperCase();
        if (keyUpper === 'O') {
          e.preventDefault();
          e.stopPropagation();
          return;
        }
        if (e.key === ',') {
          e.preventDefault();
          e.stopPropagation();
          dispatchCommand('SETTINGS');
          return;
        }
      }

      // ?뮕 [湲濡쒕쾶 ?명꽣 ?쒖뼱 ?⑥텞???덉쇅 媛??
      // ?뚮줈???대컮, ?대컮, ?ъ씠?쒕컮, 紐⑤뱶, ?뚮쭏 ?꾪솚 ?⑥텞??Ctrl+Shift+F1 ~ F5)??      // ?먮뵒???ъ빱???좊Т? 愿怨꾩뾾??釉뚮씪?곗? 湲곕낯 ?숈옉(?? F5 ?덈줈怨좎묠, F3 寃????怨?異⑸룎?섏뿬 ?ㅼ옉?숉븯??寃껋쓣 ?먯쿇 李⑤떒?섍린 ?꾪빐
      // ?ъ빱??泥댄겕 ?꾩뿉 ?꾩뿭?곸쑝濡??대깽?몃? 媛濡쒖콈???섎룞 寃⑸컻?쒗궢?덈떎.
      const combinationPartsForGlobal: string[] = [];
      if (isCtrl) combinationPartsForGlobal.push('CTRL');
      if (isShift) combinationPartsForGlobal.push('SHIFT');
      if (isAlt) combinationPartsForGlobal.push('ALT');
      combinationPartsForGlobal.push(e.key.toUpperCase());
      const combinationStrForGlobal = combinationPartsForGlobal.join('+');

      const globalOnlyKeys = ['toggleFloatingToolbar', 'toggleToolbar', 'toggleSidebar', 'toggleMode', 'toggleTheme'];
      let handledGlobal = false;
      for (const keyId of globalOnlyKeys) {
        const configuredHotkey = customHotkeys[keyId] || (TOOLBAR_ITEMS.find(item => item.id === keyId)?.defaultHotkey);
        if (!configuredHotkey) continue;
        const normalizedConfig = configuredHotkey
          .replace(/\s+/g, '')
          .toUpperCase()
          .replace('CTRLCMD', 'CTRL');

        if (combinationStrForGlobal === normalizedConfig) {
          e.preventDefault();
          e.stopPropagation();
          const cmdType = mapIdToCommandType(keyId);
          dispatchCommand(cmdType);
          handledGlobal = true;
          break;
        }
      }
      if (handledGlobal) return;

      // ?먮뵒???ъ빱?ㅺ? ?쒖꽦?붾릺???덉쓣 ?뚮쭔 ?먮뵒???⑥텞???명꽣?됲꽣 ?묐룞
      if (!editorRef.current || !editorRef.current.hasTextFocus()) return;

      let key = e.key.toUpperCase();

      // 1. Shift ?뚮┝???섑븳 ?レ옄 ?ㅼ쓽 湲고샇 蹂議?蹂댁젙 (& -> 7, * -> 8)
      if (e.code.startsWith('Digit')) {
        key = e.code.substring(5); // 'Digit7' -> '7'
      }

      // 2. ?쒓? ?낅젰湲?IME) ?곹깭?닿굅???????꾪솚 ?곹깭?먯꽌 ?곷Ц?먭? ?꾨땶 ???낅젰 臾쇰━ 蹂듭썝
      if (isCtrl || isAlt) {
        if (e.code && e.code.startsWith('Key')) {
          key = e.code.substring(3).toUpperCase(); // 'KeyX' -> 'X'
        } else if (e.code && e.code.startsWith('Digit')) {
          key = e.code.substring(5); // 'Digit7' -> '7'
        }
      }

      // 議고빀 ?ㅼ틪 ??臾몄옄???앹꽦 (?? CTRL+SHIFT+X)
      const combinationParts: string[] = [];
      if (isCtrl) combinationParts.push('CTRL');
      if (isShift) combinationParts.push('SHIFT');
      if (isAlt) combinationParts.push('ALT');
      combinationParts.push(key);

      const combinationStr = combinationParts.join('+');

      // ?깅줉???⑥텞??紐⑸줉?먯꽌 ?쇱튂?섎뒗 湲곕뒫 ?ㅼ틪
      for (const item of TOOLBAR_ITEMS) {
        const configuredHotkey = customHotkeys[item.id] || item.defaultHotkey;
        if (!configuredHotkey) continue;

        // ?⑥텞??鍮꾧탳 ?щ㎎ ?쒖? ?뺢퇋??(?? 'Ctrl + Shift + X' -> 'CTRL+SHIFT+X')
        const normalizedConfig = configuredHotkey
          .replace(/\s+/g, '')
          .toUpperCase()
          .replace('CTRLCMD', 'CTRL');

        if (combinationStr === normalizedConfig) {
          // ?⑥텞??留ㅼ튂 ?깃났: 釉뚮씪?곗? 湲곕낯 諛??대깽???꾪뙆 媛뺤젣 ?듭젣
          e.preventDefault();
          e.stopPropagation();

          const cmdType = mapIdToCommandType(item.id);
          dispatchCommand(cmdType);
          break;
        }
      }
    };

    // 罹≪쿂(true) 紐⑤뱶濡??깅줉?섏뿬 理쒖슦?좎닚?꾨줈 媛濡쒖콝?덈떎.
    window.addEventListener('keydown', handleGlobalKeyDown, true);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown, true);
  }, [customHotkeys, dispatchCommand, mapIdToCommandType, floatingToolbar.visible, setFloatingToolbar]);

  // ====================================================================
  // ?뱤 [OMD-CORE-MainEditorApp-0074] MainEditorApp.tsx ??toc
  // ?렞 @KICK  : 留덊겕?ㅼ슫 ?쒕ぉ?먯꽌 紐⑹감瑜??앹꽦?섍퀬 肄붾뱶 釉붾줉? 嫄대꼫?곷땲??  // ?썳截?@GUARD : BOM 臾몄옄瑜??쒓굅?섍퀬 肄붾뱶 釉붾줉 ?쒖뒪瑜?媛먯??섏뿬 ?ㅽ깘??諛⑹??⑸땲??  // ?슚 @PATCH : None
  // ?뵕 @CALLS : None
  // ====================================================================
  const toc = useMemo(() => {
    if (typeof content !== 'string') return [];
    // ?덈룄???ㅽ??쇱쓽 媛쒗뻾(\r\n)怨??쇰컲 媛쒗뻾(\n) 紐⑤몢瑜??덉쟾?섍쾶 遺꾨━
    const lines = content.split(/\r?\n/);
    const items: { id: string, text: string, level: number, lineNumber: number }[] = [];
    let isInCodeBlock = false;
    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('```')) {
        isInCodeBlock = !isInCodeBlock;
        return;
      }
      if (isInCodeBlock) return;

      // UTF-8 BOM(\ufeff)???쒓굅?섍퀬, ?묒そ 怨듬갚???뺣━??源⑤걮???띿뒪?몃줈 ?ㅻ뜑瑜?留ㅼ묶
      const cleanLine = trimmed.replace(/^\ufeff/, '');
      const match = cleanLine.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
          let text = match[2].trim();
          
          // ?뮕 媛쒖슂(TOC)?먯꽌 留덊겕?ㅼ슫 ?쒓렇媛 洹몃?濡??몄텧?섎뒗 ?꾩긽 諛⑹?
          text = text.replace(/\*\*(.*?)\*\*/g, '$1') // 援듦쾶 **
                     .replace(/__(.*?)__/g, '$1') // 援듦쾶 __
                     .replace(/\*(.*?)\*/g, '$1') // 湲곗슱??*
                     .replace(/_(.*?)_/g, '$1') // 湲곗슱??_
                     .replace(/~~(.*?)~~/g, '$1') // 痍⑥냼??~~
                     .replace(/`(.*?)`/g, '$1') // ?몃씪??肄붾뱶
                     .replace(/\[(.*?)\]\(.*?\)/g, '$1') // 留곹겕 [?띿뒪??(URL) -> ?띿뒪??                     .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // ?대?吏 ![?띿뒪??(URL) -> ?띿뒪??                     .replace(/<[^>]*>?/gm, ''); // HTML ?쒓렇 ?쒓굅
                     
          const lineNumber = index + 1;
        items.push({
          id: `toc-line-${lineNumber}`,
          text,
          level,
          lineNumber
        });
      }
    });
    return items;
  }, [content]);

  const heightClass = 'h-[calc(100vh-128px)]';
  const activeTab = tabs.find(t => t.id === activeTabId);
  // ?썳截?[EMBEDDED WELCOME 2026-07-07] ?쒗븳?ъ슜????licenseStatus濡?吏곸젒 ?먮떒.
  // ??肄섑뀗痢?activeTabId ?곹깭? 臾닿??섍쾶 媛뺤젣濡?embedded ?섏쁺 ?섏씠吏瑜??뚮뜑留곹빀?덈떎.
  const showEmbeddedWelcome = false;
  const openTabPaths = useMemo(() => tabs.map(t => t.path).filter(Boolean) as string[], [tabs]);

  const contextValue = {
    content, setContent,
    tabs, setTabs,
    activeTabId, setActiveTabId,
    previewMode, setPreviewMode,
    isA4GuardEnabled, setIsA4GuardEnabled,
    currentFileName, setCurrentFileName,
    currentFileNode, setCurrentFileNode,
    workspaceType, setWorkspaceType,
    rootFolder, setRootFolder,
    resourceFolder, resourceFolderHandle,
    fileList, setFileList,
    dispatchCommand,
    isDarkMode, setIsDarkMode,
    themePalette, handleThemeChange,
    licenseStatus, isExpired: licenseStatus.isExpired,
    isAddonEnv, editorRef, previewRef, showToast, openTabPaths, refreshFileList,
    driveLetter, profiles, activeProfileId, DEFAULT_PROFILE: (window as any).DEFAULT_PROFILE || {},
    saveStatus, isToolbarOpen, setIsToolbarOpen, isSidebarOpen, setIsSidebarOpen, isActivated, THEME_MAP,
    cursorLine,
    cursorColumn,
    switchTab, closeTab, createNewTab,
    isSearchOpen, setIsSearchOpen,
    sidebarWidth, setSidebarWidth, sidebarTab, setSidebarTab,
    setCurrentFileName, lastSavedContentRef, toc, scrollToLine, openFile: handleFileClick,
    askConfirm: (config: any) => setConfirmConfig({ isOpen: true, ...config }),
    isMergeMode, setIsMergeMode, selectedMergeNodes, setSelectedMergeNodes, toggleMergeNodeSelect,
    onOpenMergeModal: handleOpenMergeModal, onSelectRootFolder: () => selectRootFolder('local', null),
    onRestoreFolder: restoreFolderPermission,
    isHelpModalOpen, setIsHelpModalOpen, helpTitle, setHelpTitle, helpContent, setHelpContent,
    tabs,
    geminiApiKey,
    aiModelName
  };

  const { handleMount } = useMonacoSetup({
    editorRef, tabsRef, activeTabIdRef, contentRef, isComposingRef, previewDebounceRef,
    setContent, setTabs, activeTabId, setSaveStatus, currentFileNodeRef, lastSavedContentRef,
    saveFile, autoSaveRef, previewModeRef, previewRef, isScrollingRef, scrollTimeoutRef,
    isEditorReady, setIsEditorReady, themePalette, EDITOR_THEMES, updateDecorations,
    decorationsCollectionRef, isEditorHovered, prevCursorLineRef,
    setActiveLine, setCursorLine, setCursorColumn, tabSizeRef, setFloatingToolbar, lastSelectionRef,
    completionProviderRef, getSlashCommands, customSlashCommandsRef,
    handleEditorPaste, handlePasteImageFile,
    wikilinkProviderRef, docLinkFilesRef, readFileTextRef, extractHeadings, getRelativePath,
    isEditorMountedRef, updateContent
  });

  // Get docLinkPicker absolute screen coordinates based on cursor position
  let docLinkPickerStyle: React.CSSProperties = { top: 0, left: 0 };
  if (showDocLinkPicker && editorRef.current) {
    const editor = editorRef.current;
    const position = editor.getPosition();
    if (position) {
      const visiblePos = editor.getScrolledVisiblePosition(position);
      if (visiblePos) {
        const editorDom = editor.getContainerDomNode();
        if (editorDom) {
          const rect = editorDom.getBoundingClientRect();
          let top = visiblePos.top + rect.top + 22;
          let left = visiblePos.left + rect.left;
          if (typeof window !== 'undefined') {
            if (left + 280 > window.innerWidth) {
              left = Math.max(16, window.innerWidth - 296);
            }
            if (left < 16) {
              left = 16;
            }
            if (top + 350 > window.innerHeight) {
              top = Math.max(16, visiblePos.top + rect.top - 356);
            }
          }
          docLinkPickerStyle = { top, left };
        }
      }
    }
  }
  if (docLinkPickerStyle.top === 0 && docLinkPickerStyle.left === 0) {
    let fixedTop = floatingToolbar.top;
    let fixedLeft = floatingToolbar.left;
    if (editorRef.current) {
      const editorDom = editorRef.current.getContainerDomNode();
      if (editorDom) {
        const rect = editorDom.getBoundingClientRect();
        fixedTop += rect.top;
        fixedLeft += rect.left;
      }
    }
    docLinkPickerStyle = { top: fixedTop + 44, left: fixedLeft };
  }
  const handleAIDraftApply = (draftContent: string, action: 'insert' | 'replace' | 'append', scope: 'selection' | 'document' | 'none' = 'none') => {
    setIsAIDraftModalOpen(false); // Close modal
    
    if (editorRef.current) {
      const editor = editorRef.current;
      const position = editor.getPosition() || { lineNumber: 1, column: 1 };
      const selection = editor.getSelection();
      const model = editor.getModel();
      const monacoObj = typeof window !== 'undefined' && (window as any).monaco ? (window as any).monaco : null;
      
      if (model && monacoObj) {
        if (action === 'insert') {
          const insertText = `\n\n${draftContent}\n\n`;
          editor.executeEdits("AI_DRAFT_INSERT", [{
            range: new monacoObj.Range(position.lineNumber, position.column, position.lineNumber, position.column),
            text: insertText,
            forceMoveMarkers: true
          }]);
          editor.setPosition({ lineNumber: position.lineNumber + 2, column: 1 });
          editor.revealPositionInCenter({ lineNumber: position.lineNumber + 2, column: 1 }, 1);
          showToast("?묒꽦??珥덉븞??蹂몃Ц???쎌엯?섏뿀?듬땲?? (Ctrl+Z ?ㅽ뻾痍⑥냼 媛??", "success");
        } else if (action === 'replace') {
          if (scope === 'document') {
            const fullRange = model.getFullModelRange();
            editor.executeEdits("AI_MODAL_REPLACE_DOC", [{
              range: fullRange,
              text: draftContent,
              forceMoveMarkers: true
            }]);
            showToast("臾몄꽌 ?꾩껜媛 ?덈줈 ?묒꽦???댁슜?쇰줈 ??뼱?뚯썙議뚯뒿?덈떎.", "success");
          } else if (selection && !selection.isEmpty()) {
            editor.executeEdits("AI_MODAL_REPLACE", [{
              range: selection,
              text: draftContent,
              forceMoveMarkers: true
            }]);
            showToast("湲곗〈 ?띿뒪?멸? ??뼱?뚯썙議뚯뒿?덈떎. (Ctrl+Z ?ㅽ뻾痍⑥냼 媛??", "success");
          }
        } else if (action === 'append') {
          let endLine = model.getLineCount();
          if (selection && !selection.isEmpty() && scope !== 'document') {
            endLine = selection.endLineNumber;
          }
          const endCol = model.getLineMaxColumn(endLine);
          const insertRange = new monacoObj.Range(endLine, endCol, endLine, endCol);
          
          const formattedText = `\n\n---\n#### [AI 援먯젙臾?\n${draftContent}\n---\n`;
          editor.executeEdits("AI_MODAL_APPEND", [{
            range: insertRange,
            text: formattedText,
            forceMoveMarkers: true
          }]);
          showToast("?좏깮???댁슜 ?꾨옒???㏓텤?ъ죱?듬땲??", "success");
        }
      }
      editor.focus();
      updateContent(editor.getValue());
    }
  };



  return (
    <>
      <style>{`
        .ai-changed-highlight {
          background-color: rgba(168, 85, 247, 0.25) !important;
          animation: ai-flash-fade 1.5s ease-out forwards;
        }
        @keyframes ai-flash-fade {
          0% { background-color: rgba(168, 85, 247, 0.35); }
          100% { background-color: rgba(168, 85, 247, 0); }
        }
        .ai-stream-pulse {
          animation: ai-pulse-bg 2s infinite ease-in-out;
        }
        @keyframes ai-pulse-bg {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        .mic-pulse {
          animation: mic-pulse-anim 1.5s infinite;
        }
        @keyframes mic-pulse-anim {
          0% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.7); }
          70% { box-shadow: 0 0 0 10px rgba(168, 85, 247, 0); }
          100% { box-shadow: 0 0 0 0 rgba(168, 85, 247, 0); }
        }
      `}</style>
      <EditorProvider value={contextValue}>
        <div className={`flex h-screen overflow-hidden flex-col text-on-surface transition-colors duration-300 ${mounted && isDarkMode ? 'dark bg-zinc-950 text-zinc-100' : 'bg-surface'}`}>

          <MenuBar />



          <div className="flex flex-1 overflow-hidden relative">
            <LeftSidebar />

            <main className="flex flex-1 flex-col overflow-hidden bg-transparent">
              

              {/* ??諛붾? ?ㅻⅨ履??먮뵒??誘몃━蹂닿린 ?곸뿭?먮쭔 ?꾩튂?섎룄濡?main ?곷떒??諛곗튂 */}
              {!showEmbeddedWelcome && (
                <div className="no-print flex flex-col w-full">
                  <UnifiedTabBar />
                  {activeTab && (
                    <div className="flex items-center px-4 py-1 border-b border-black/5 dark:border-white/5 bg-zinc-100 dark:bg-zinc-900/80 text-[10px] text-zinc-500 font-semibold shadow-inner z-10">
                      <span className="truncate max-w-full opacity-70 hover:opacity-100 transition-opacity cursor-default">
                        ?뱚 {workspaceType === 'browser' ? (rootFolder?.name ? `${rootFolder.name} \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}` : `?뙋 Browser Storage \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}`) : (workspaceType === 'cloud' ? `[${cloudProvider || 'Cloud'}] \\ ${rootFolder?.name || 'Sync'} \\ ${(currentFileNode?.path || currentFileName).replace(/[\\/]/g, ' \\ ')}` : (currentFileNode?.path?.includes(':') ? currentFileNode.path : `${driveLetter}\\??臾몄꽌\\${currentFileName}`))}
                      </span>
                    </div>
                  )}
                </div>
              )}
              {showEmbeddedWelcome ? (
                <div className="flex-1 overflow-y-auto bg-zinc-100">
                  <div className="max-w-4xl mx-auto py-8 px-4">
                    <MarkdownViewer
                      content={getWelcomeContent()}
                      originalContent={getWelcomeContent()}
                      lineMap={[]}
                      onFileOpen={handleFileOpenByPath}
                      rootFolderPath={rootFolder?.name}
                      rootFolder={rootFolder}
                      resourceFolderHandle={resourceFolderHandle}
                      resourceFolder={resourceFolder}

                      workspaceType={workspaceType}
                    />
                  </div>
                </div>
              ) : (
                // ?뮕 [吏?ν삎 鍮??섏씠吏 媛?? ?대젮?덈뒗 ??씠 ?꾩삁 ?놁쓣 ???먮뵒??諛?誘몃━蹂닿린瑜??뚯깋 李⑤떒 ?곸뿭?쇰줈 ?뚮뜑留?                tabs.length === 0 || !activeTab ? (
                  <div className="flex-grow flex flex-col items-center justify-center bg-zinc-200 dark:bg-zinc-900 text-center gap-4 transition-all duration-300 p-8 select-none">
                    <div className="p-4 bg-zinc-300/60 dark:bg-zinc-800/85 rounded-full text-zinc-500 dark:text-zinc-400 shadow-sm">
                      <Lock size={32} />
                    </div>
                    <div className="flex flex-col gap-2">
                      <h3 className="text-sm font-black text-zinc-700 dark:text-zinc-200">
                        ?쒖꽦?붾맂 臾몄꽌媛 ?놁뒿?덈떎 (?몄쭛 諛?議곗옉 遺덇?)
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold max-w-sm leading-relaxed">
                        ?꾩옱 ?꾨Т???묒뾽???섑뻾?????녿뒗 鍮??곹깭?낅땲??
                        <br />
                        醫뚯륫 ?뚯씪 ?먯깋湲곗뿉??留덊겕?ㅼ슫(.md) ?뚯씪???좏깮?섏뿬 臾몄꽌瑜??댁뼱二쇱꽭??
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-1 overflow-hidden">

                    <div
                      className="flex-1 min-w-0 relative border-r border-zinc-200 dark:border-zinc-800 transition-colors duration-300 no-print bg-surface-container-low dark:bg-zinc-950"
                      style={{ display: (previewMode === 'preview' || activeTab?.isStyleTab === true) ? 'none' : 'block' }}
                    >
                      <Editor
                        height="100%"
                        language="markdown"
                        theme={themePalette}
                        // ?뮕 value={content} ?띿꽦??諛곗젣?섍퀬 defaultValue瑜??곸슜?섏뿬
                        // React ?곹깭 媛깆떊 ??紐⑤굹肄??대???遺덊븘?뷀븳 setValue ?몄텧濡??명븳 ?쒓? composition 源⑥쭚 諛?以묐났 ?낅젰???먯쿇 諛⑹뼱?⑸땲??
                        defaultValue={content}
                        onChange={(val) => {
                          // ?뮕 [?먮뵒???몃쭏?댄듃 ?곗씠???좎떎 媛??
                          // ?먮뵒?곌? ?몃쭏?댄듃???곹깭?닿굅???뚭눼 吏꾪뻾 以묒씠硫?紐⑤뱺 蹂寃??낅젰??臾댁떆?섏뿬 ?곗씠???좎떎???꾩쟾 媛?쒗빀?덈떎.
                          if (!isEditorMountedRef.current) return;
                          if (previewModeRef.current === 'preview') return; // ?뮕 [媛?? 誘몃━蹂닿린 紐⑤뱶?????낅젰 踰꾪띁 媛깆떊 ?먯쿇 諛⑹?

                          const editor = editorRef.current;
                          if (editor) {
                            const dom = editor.getDomNode();
                            const model = editor.getModel();
                            if (!dom || !model) {
                              return; // ?먮뵒?곌? ?뚭눼 以묒씠誘濡?鍮?媛?臾댁떆
                            }
                          }
                          updateContent(val || '', true);
                        }}
                        beforeMount={(monaco) => {
                          EDITOR_THEMES.forEach(t => {
                            monaco.editor.defineTheme(t.id, {
                              base: t.base,
                              inherit: true,
                              rules: t.rules,
                              colors: {
                                ...t.colors,
                                'editor.background': '#00000000', // ?꾨━誘몄뾼 猷⑹쓣 ?꾪븳 ?꾩쟾 ?щ챸 諛곌꼍 (遺紐?UI? ?쇱껜??
                                'editor.lineHighlightBackground': '#88888810', // ?고븳 ?섏씠?쇱씠??                                'editorLineNumber.foreground': '#88888850', // ?吏 ?딅뒗 以꾨쾲??                                'editorIndentGuide.background': '#88888815', // ?????ㅼ뿬?곌린 媛?대뱶
                                'editorIndentGuide.activeBackground': '#88888830',
                              }
                            });
                          });
                        }}
                        onMount={handleMount}
                        options={{
                          readOnly: tabs.length === 0 || isRestrictedUser,
                          domReadOnly: tabs.length === 0 || isRestrictedUser,
                          padding: { top: 48, bottom: 0, right: 64 }, // ?곸젅???ъ빱???⑤뵫 (bottom 0?쇰줈 ?ㅼ젙?섏뿬 留덉?留?以??붾뱾由?踰꾧렇 ?닿껐)
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          fontSize,
                          lineHeight: 1.7, // ?쒖썝??以꾧컙寃??좎? (?몃젴??
                          fontFamily: "'D2Coding', 'JetBrains Mono', 'Pretendard', Consolas, 'Malgun Gothic', '留묒? 怨좊뵓', monospace",
                          fontLigatures: false, // 湲????怨꾩궛 ?ㅼ감瑜??좊컻?????덈뒗 ?⑹옄(Ligature) 湲곕뒫 ?댁젣
                          letterSpacing: 0,
                          'semanticHighlighting.enabled': true,
                          wordWrap,
                          lineNumbers: 'on',
                          minimap: { enabled: false },
                          autoClosingBrackets: autoClosingBrackets ? 'languageDefined' : 'never',
                          scrollbar: { vertical: 'visible', horizontal: 'visible' },
                          // ?щ옒??/) ?낅젰 ?쒖뿉留??먮룞?꾩꽦 ?몃━嫄?(?쇰컲 ??댄븨 ???앹뾽 諛⑹?)
                          quickSuggestions: false,
                          suggestOnTriggerCharacters: true,
                          // Enter/Tab ?섎씫? 而ㅼ뒪? ?몃뱾?ъ뿉??泥섎━ (由ъ뒪???먮룞?꾩꽦怨?異⑸룎 諛⑹?)
                          acceptSuggestionOnEnter: 'on',
                          tabCompletion: 'on',
                          fixedOverflowWidgets: true,
                          renderValidationDecorations: 'on',
                          matchBrackets: 'always',
                          wordBasedSuggestions: "off",
                          renderLineHighlight: 'all',
                          // ?뮕 留덊겕?ㅼ슫 ?ㅼ뿬?곌린 洹쒓꺽 以?섎? ?꾪빐 4移?媛뺤젣 怨좎젙
                          tabSize: 4,
                          detectIndentation: false,
                          insertSpaces: true,
                          autoIndent: 'none',
                          links: false
                        }}
                      />
                      {floatingToolbar.visible && (() => {
                        const editorDom = editorRef.current?.getContainerDomNode();
                        let fixedTop = floatingToolbar.top;
                        let fixedLeft = floatingToolbar.left;
                        if (editorDom) {
                          const rect = editorDom.getBoundingClientRect();
                          fixedTop += rect.top;
                          fixedLeft += rect.left;
                        }
                        const handleDragStart = (dragEvent: React.MouseEvent) => {
                          const target = dragEvent.target as HTMLElement;
                          if (target.closest('button') || target.closest('input')) {
                            return;
                          }
                          dragEvent.preventDefault();
                          const startX = dragEvent.clientX;
                          const startY = dragEvent.clientY;
                          const startLeft = floatingToolbar.left;
                          const startTop = floatingToolbar.top;

                          const handleDragMove = (moveEvent: MouseEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const deltaY = moveEvent.clientY - startY;
                            setFloatingToolbar(prev => ({
                              ...prev,
                              left: startLeft + deltaX,
                              top: startTop + deltaY
                            }));
                          };

                          const handleDragEnd = () => {
                            document.removeEventListener('mousemove', handleDragMove);
                            document.removeEventListener('mouseup', handleDragEnd);
                          };

                          document.addEventListener('mousemove', handleDragMove);
                          document.addEventListener('mouseup', handleDragEnd);
                        };

                        return (
                          <div
                            id="floating-toolbar"
                            tabIndex={-1}
                            onKeyDown={(e) => {
                              e.stopPropagation();
                              const buttons = Array.from(e.currentTarget.querySelectorAll('button')) as HTMLButtonElement[];
                              const activeEl = document.activeElement as HTMLButtonElement;
                              const currentIndex = buttons.indexOf(activeEl);
                              if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
                                e.preventDefault();
                                const nextIndex = (currentIndex + 1) % buttons.length;
                                buttons[nextIndex]?.focus();
                              } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
                                e.preventDefault();
                                const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
                                buttons[prevIndex]?.focus();
                              } else if (e.key === 'Escape') {
                                e.preventDefault();
                                setFloatingToolbar(prev => ({ ...prev, visible: false }));
                                editorRef.current?.focus();
                              }
                            }}
                            className="fixed z-[99999] flex items-center bg-white dark:bg-zinc-800 shadow-2xl shadow-black/15 rounded-xl border border-black/5 dark:border-white/10 px-3 py-1.5 gap-1 animate-in fade-in zoom-in-95 duration-100 focus:outline-none cursor-move select-none"
                            style={{ top: Math.max(fixedTop, 60), left: fixedLeft, transform: 'translateY(-100%)' }}
                            onMouseDown={handleDragStart}
                          >
                            {(() => {
                              return (
                                <div className="flex flex-row items-center gap-3 min-w-max">
                                  {/* AI ?⑤룆 ?꾩씠肄?*/}
                                  <div className="flex items-center">
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        dispatchCommand('OPEN_AI_WRITER' as any);
                                        setFloatingToolbar(prev => ({ ...prev, visible: false }));
                                      }}
                                      className={`w-7 h-7 rounded-lg transition-all flex items-center justify-center shrink-0 ${geminiApiKey
                                        ? 'hover:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                        : 'hover:bg-black/5 dark:hover:bg-white/5 text-slate-400 dark:text-zinc-500'
                                        }`}
                                      title={geminiApiKey ? "AI 湲?곌린 ?댁떆?ㅽ꽩?? : "AI 湲?곌린 (?ㅼ젙?먯꽌 API ?ㅻ? ?깅줉??二쇱꽭??"}
                                    >
                                      <Sparkles size={14} className={geminiApiKey ? "animate-pulse" : ""} />
                                    </button>

                                  </div>
                                  <div className="w-px h-5 bg-black/10 dark:bg-white/10 shrink-0" />

                                  {/* ?쒖떇 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('BOLD'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] font-black" title="援듦쾶">B</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ITALIC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] italic font-serif" title="湲곗슱??>I</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('INLINE_CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?몃씪??肄붾뱶">{'</>'}</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('UNDERLINE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] underline" title="諛묒쨪">U</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('STRIKETHROUGH'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="痍⑥냼??><span className="line-through">S</span></button>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* ?쒕ぉ */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <div className="flex items-center border border-emerald-500/20 dark:border-emerald-500/30 rounded bg-emerald-500/5 dark:bg-emerald-500/10 py-0.5 px-1.5 gap-1.5">
                                      <button onMouseDown={(e) => { e.preventDefault(); setFloatingHeadingLevel(Math.max(1, floatingHeadingLevel - 1)); }} disabled={floatingHeadingLevel === 1} className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]" title="?쒕ぉ ?ш린 ?ㅼ슦湲?(H1 諛⑺뼢)">??/button>
                                      <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand(`H${floatingHeadingLevel}`); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-6 flex items-center justify-center font-bold text-[11px] hover:bg-black/10 dark:hover:bg-white/10 rounded shrink-0" title={`?쒕ぉ ${floatingHeadingLevel} ?곸슜`}>H{floatingHeadingLevel}</button>
                                      <button onMouseDown={(e) => { e.preventDefault(); setFloatingHeadingLevel(Math.min(6, floatingHeadingLevel + 1)); }} disabled={floatingHeadingLevel === 6} className="w-5 h-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-30 text-[9px]" title="?쒕ぉ ?ш린 以꾩씠湲?(H6 諛⑺뼢)">??/button>
                                    </div>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* 臾몃떒 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('HR'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="援щ텇??>??/button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('ORDERED_LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?レ옄 紐⑸줉">?뵢</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LIST'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="湲癒몃━ 湲고샇">??/button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('QUOTE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?몄슜援?>??/button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CHECK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="泥댄겕由ъ뒪??>?묕툘</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('REMOVE_PREFIX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?쒓렇 痍⑥냼"><Eraser size={14} className="text-red-500 opacity-80 hover:opacity-100" /></button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CLEAN_DOC'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="臾몄꽌 ?쒖떇 ?쇨큵 ?뺣━">?㏏</button>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* ?쎌엯 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LINK'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="留곹겕">?뵕</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('DOCLINK'); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="臾몄꽌 ?곌껐">?뵔</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CITE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?몄슜(李몄“臾명뿄)">?뱷</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('FOOTNOTE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px] font-bold font-serif" title="媛곸＜">fn</button>
                                    <div className="w-px h-5 mx-0.5 bg-black/10 dark:bg-white/10 shrink-0" />
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('IMAGE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?대?吏">?뼹截?/button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('YOUTUBE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?숈쁺?곸궫??>?렄截?/button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('NOW'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?꾩옱 ?좎쭨/?쒓컙">?뱟</button>
                                  </div>
                                  <div className="w-px h-8 bg-black/10 dark:bg-white/10" />
                                  {/* 怨좉툒 */}
                                  <div className="flex flex-row items-center gap-0.5">
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('MAP'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="吏???쎌엯">?뙊</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('TABLE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="???앹꽦">?벛</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('CODE'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="肄붾뱶 釉붾줉">?⑨툘</button>
                                    <button onMouseDown={(e) => { e.preventDefault(); dispatchCommand('LATEX'); setFloatingToolbar(prev => ({ ...prev, visible: false })); }} className="w-7 h-7 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-all flex items-center justify-center text-[13px]" title="?섏떇(LaTeX)">?㎜</button>
                                  </div>
                                </div>
                              );
                            })()}
                          </div>
                        )
                      })()}
                    </div>

                    {showDocLinkPicker && (
                      <>
                        <div
                          className="fixed inset-0 z-[9998]"
                          onMouseDown={() => {
                            setShowDocLinkPicker(false);
                            setDocLinkSearchText('');
                          }}
                        />
                        <div
                          className="fixed z-[9999] bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-600 rounded-lg shadow-xl p-2 w-[280px] max-h-[350px] flex flex-col"
                          style={docLinkPickerStyle}
                        >
                          {!selectedDocNode ? (
                            <>
                              <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-700 mb-2">
                                ?ㅻⅨ 臾몄꽌 ?곌껐
                              </div>
                              <div className="px-2 mb-2">
                                <input
                                  type="text"
                                  placeholder="?뚯씪 寃??.."
                                  value={docLinkSearchText}
                                  onChange={(e) => setDocLinkSearchText(e.target.value)}
                                  className="w-full px-2 py-1 text-[12px] border border-slate-200 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                              </div>
                              <div className="flex-1 overflow-y-auto min-h-0">
                                {isDocLinkLoading ? (
                                  <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                                    臾몄꽌 紐⑸줉 濡쒕뵫 以?..
                                  </div>
                                ) : (() => {
                                  const filtered = allMdFiles.filter(f =>
                                    f.name.toLowerCase().includes(docLinkSearchText.toLowerCase()) ||
                                    (f.path && f.path.toLowerCase().includes(docLinkSearchText.toLowerCase()))
                                  );
                                  if (filtered.length === 0) {
                                    return (
                                      <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                                        寃??寃곌낵媛 ?놁뒿?덈떎.
                                      </div>
                                    );
                                  }
                                  return filtered.map((node) => (
                                    <button
                                      key={node.path}
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleDocFileClick(node);
                                      }}
                                      className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-slate-100 dark:hover:bg-zinc-700 rounded flex flex-col transition-colors mb-0.5"
                                    >
                                      <span className="font-semibold truncate text-slate-800 dark:text-zinc-200">{node.name}</span>
                                      <span className="text-[10px] text-slate-400 dark:text-zinc-500 truncate">{node.path}</span>
                                    </button>
                                  ));
                                })()}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="px-2 py-1 text-[11px] font-semibold text-slate-500 dark:text-zinc-400 border-b border-slate-200 dark:border-zinc-700 mb-2 flex items-center justify-between">
                                <span>?ㅻ뵫(?쒕ぉ) ?곌껐 ?좏깮</span>
                                <button
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setSelectedDocNode(null);
                                    setDocHeadings([]);
                                    setDocHeadingSearchText('');
                                  }}
                                  className="text-xs text-blue-500 hover:text-blue-600 font-normal"
                                >
                                  ?댁쟾
                                </button>
                              </div>
                              <div className="px-2 mb-2">
                                <input
                                  type="text"
                                  placeholder="?ㅻ뵫 寃??.."
                                  value={docHeadingSearchText}
                                  onChange={(e) => setDocHeadingSearchText(e.target.value)}
                                  className="w-full px-2 py-1 text-[12px] border border-slate-200 dark:border-zinc-700 rounded bg-slate-50 dark:bg-zinc-900 text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-blue-500"
                                  autoFocus
                                />
                              </div>
                              <div className="flex-1 overflow-y-auto min-h-0">
                                {isHeadingLoading ? (
                                  <div className="px-2 py-3 text-center text-[12px] text-slate-400 dark:text-zinc-500">
                                    ?ㅻ뵫 遺꾩꽍 以?..
                                  </div>
                                ) : (
                                  <>
                                    <button
                                      onMouseDown={(e) => {
                                        e.preventDefault();
                                        handleDocLinkSelect(selectedDocNode);
                                      }}
                                      className="w-full text-left px-2 py-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors mb-1 font-semibold"
                                    >
                                      ?뱛 [臾몄꽌 ?먯껜瑜?諛붾줈 ?곌껐]
                                    </button>
                                    {(() => {
                                      const filteredHeadings = docHeadings.filter(h =>
                                        h.toLowerCase().includes(docHeadingSearchText.toLowerCase())
                                      );
                                      if (filteredHeadings.length === 0) {
                                        return (
                                          <div className="px-2 py-2 text-[11px] text-slate-400 dark:text-zinc-500 text-center">
                                            臾몄꽌 ?댁뿉 媛먯????ㅻ뵫???녾굅??寃??寃곌낵媛 ?놁뒿?덈떎.
                                          </div>
                                        );
                                      }
                                      return filteredHeadings.map((h, i) => (
                                        <button
                                          key={i}
                                          onMouseDown={(e) => {
                                            e.preventDefault();
                                            handleDocLinkSelect(selectedDocNode, h);
                                          }}
                                          className="w-full text-left px-2 py-1.5 text-[12px] hover:bg-slate-100 dark:hover:bg-zinc-700 rounded transition-colors truncate text-slate-700 dark:text-zinc-300"
                                        >
                                          #{h}
                                        </button>
                                      ));
                                    })()}
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </>
                    )}

                    <div
                      className="flex-1 flex flex-col bg-surface-container-low text-on-surface overflow-hidden print:overflow-visible relative"
                      style={{
                        width: previewMode === 'preview' ? '100%' : '50%',
                        display: (previewMode === 'edit' || activeTab?.isStyleTab === true) ? 'none' : 'flex'
                      }}
                    >


                      {/* ?뵇 ?ㅽ겕濡?媛?ν븳 ?ㅼ젣 蹂몃Ц 而⑦뀒?대꼫 */}
                      <div
                        ref={previewRef}
                        className={`flex-1 print:h-auto print:overflow-visible prose prose-sm md:prose-base max-w-none break-words custom-preview-container text-on-surface ${
                          previewMode === 'preview'
                            ? 'bg-surface-container-high p-4 pb-48 overflow-y-auto'
                            : 'bg-surface-container-low px-0 pt-0 pb-48 overflow-hidden'
                        } ${previewMode === 'both' ? 'no-scrollbar' : ''}`}
                        onMouseEnter={() => { isPreviewHovered.current = true; }}
                        onMouseLeave={() => { isPreviewHovered.current = false; }}
                        onWheel={() => { isPreviewHovered.current = true; }}
                        onMouseMove={() => { isPreviewHovered.current = true; }}
                        onScroll={(e) => {
                          const target = e.target as HTMLElement;

                          // ?뮕 [?붽뎄?ы빆 3 / SYNC-03] 誘몃━蹂닿린 理쒖긽??0?? 蹂듦? ???ㅽ겕濡??쎌뿉 愿怨꾩뾾???먮뵒?곕? ?먯꽍泥섎읆 理쒖긽???곸젏?쇰줈 蹂듦뎄
                          // ?썳截?[踰꾧렇 ?덈갑 媛?? ?ㅼ쭅 ?ъ슜?먭? 吏곸젒 誘몃━蹂닿린瑜?留덉슦???몃쾭?섏뿬 ?ㅽ겕濡?以묒씠嫄곕굹, ?먮뵒?곗뿉 ?섑븳 ?곕룞 ?ㅽ겕濡ㅼ씠 ?꾨땺 ?뚮쭔 ?숈옉
                          if (target.scrollTop === 0 && editorRef.current && isPreviewHovered.current && isScrollingRef.current !== 'editor') {
                            editorRef.current.setScrollTop(0);
                          }

                          // ?뮕 [?붽뎄?ы빆 3 / SYNC-03] 誘몃━蹂닿린 留덉슦???ㅻ쾭 ?곹깭???뚮쭔 ?먮뵒?곕줈 ?ㅽ겕濡??≪떊 ?덉슜 (愿???뺢? 猷⑦봽 ?먯쿇 諛⑹뇙)
                          if (!isPreviewHovered.current || previewModeRef.current !== 'both' || !editorRef.current) return;
                            if (isScrollingRef.current === 'editor') return;

                          isScrollingRef.current = 'preview';
                          if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
                          scrollTimeoutRef.current = setTimeout(() => { isScrollingRef.current = null; }, 50);

                          const elements = Array.from(target.querySelectorAll('[data-line]')) as HTMLElement[];

                          let elA = null;
                            let elB = null;
                            
                            for (let i = 0; i < elements.length; i++) {
                              const rect = elements[i].getBoundingClientRect();
                              const containerRect = target.getBoundingClientRect();
                              
                              if (rect.bottom >= containerRect.top) {
                                elA = elements[i];
                                if (i + 1 < elements.length) {
                                  elB = elements[i + 1];
                                }
                                break;
                              }
                            }
                            
                            if (elA && editorRef.current) {
                              const editor = editorRef.current;
                              const lineStrA = elA.getAttribute('data-line');
                              
                              if (lineStrA && typeof editor.getTopForLineNumber === 'function' && typeof editor.setScrollPosition === 'function') {
                                const lineA = parseInt(lineStrA, 10);
                                const topA = editor.getTopForLineNumber(lineA);
                                
                                let interpolatedScrollTop = topA;
                                
                                if (elB) {
                                  const lineStrB = elB.getAttribute('data-line');
                                  if (lineStrB) {
                                    const lineB = parseInt(lineStrB, 10);
                                    const topB = editor.getTopForLineNumber(lineB);
                                    
                                    const rectA = elA.getBoundingClientRect();
                                    const rectB = elB.getBoundingClientRect();
                                    const containerRect = target.getBoundingClientRect();
                                    
                                    const previewTopA = rectA.top - containerRect.top + target.scrollTop;
                                    const previewTopB = rectB.top - containerRect.top + target.scrollTop;
                                    
                                    const editorRange = topB - topA;
                                    const previewRange = previewTopB - previewTopA;
                                    
                                    if (previewRange > 0) {
                                      const progress = Math.max(0, Math.min(1, (target.scrollTop - previewTopA) / previewRange));
                                      interpolatedScrollTop = topA + progress * editorRange;
                                    }
                                  }
                                }
                                
                                editor.setScrollPosition({ scrollTop: interpolatedScrollTop });
                                }
                              }
                        }}
                      >
                        {(() => {
                          const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
                          const isLandscape = activeProfile.pageStyle.orientation === 'landscape';
                          // A4 議고뙋 媛?쒓? 耳쒖졇 ?덉쑝硫??몄쭛+誘몃━蹂닿린 紐⑤뱶?쇰룄 ?뚮뜑留?洹쒓꺽? 誘몃━蹂닿린 紐⑤뱶? ?숈씪?섍쾶 痍④툒
                          const isPreviewOnly = previewMode === 'preview' || isA4GuardEnabled;

                          const paperSizeKey = activeProfile.pageStyle.paperSize?.toLowerCase() || 'a4';
                          const ps = PAPER_SIZES[paperSizeKey] || PAPER_SIZES.a4;
                          const paperWidth = isLandscape ? `${ps.height}mm` : `${ps.width}mm`;
                          const minHeight = isLandscape ? `${ps.width}mm` : `${ps.height}mm`;

                          const pTop = activeProfile.pageStyle.marginTop || '20mm';
                          const pBottom = activeProfile.pageStyle.marginBottom || '20mm';
                          const pLeft = activeProfile.pageStyle.marginLeft || '20mm';
                          const pRight = activeProfile.pageStyle.marginRight || '20mm';

                          const pageStyle: React.CSSProperties = {
                            boxSizing: 'border-box' as const,
                            ...(isPreviewOnly ? {
                              width: paperWidth,
                              minHeight: minHeight,
                              zoom: isA4GuardEnabled ? previewZoomScale : undefined
                            } : {})
                          };

                          return (
                            <div
                              className={isPreviewOnly
                                ? "preview-page-sheet group relative mx-auto my-8 border border-purple-500/5 shadow-[0_16px_48px_rgba(15,0,109,0.04)] bg-white dark:bg-zinc-900 rounded-2xl transition-all duration-300 transform-gpu origin-top overflow-hidden pb-56"
                                : `preview-page-sheet group relative mx-auto my-6 ${isLandscape ? 'max-w-6xl' : 'max-w-3xl'} w-full bg-white dark:bg-zinc-900 border border-purple-500/5 shadow-[0_12px_42px_rgba(15,0,109,0.03)] rounded-2xl transition-all duration-300 origin-top overflow-hidden pb-56`
                              }
                              style={pageStyle}
                            >
                              {/* 誘몃━蹂닿린 蹂듭궗 踰꾪듉 */}
                                <div className="absolute top-4 right-4 z-50 no-print opacity-30 hover:opacity-100 transition-opacity duration-200">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!previewRef.current) return;
                                      
                                      const btn = e.currentTarget;
                                      const originalText = btn.innerHTML;
                                      
                                      try {
                                        const selection = window.getSelection();
                                        const originalRange = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                                        
                                        const range = document.createRange();
                                        const targetEl = previewRef.current.querySelector('.markdown-viewer-root') || previewRef.current;
                                        
                                        // ?대?吏 blob URL??base64濡??꾩떆 蹂??(Electron fetch 李⑤떒 ?鍮?罹붾쾭???ъ슜)
                                        const imgs = Array.from(targetEl.querySelectorAll('img'));
                                        const restoredImgs = [];
                                        for (const img of imgs) {
                                          const src = img.src;
                                          if (src && src.startsWith('blob:')) {
                                            try {
                                              if (img.complete && img.naturalWidth > 0) {
                                                const canvas = document.createElement('canvas');
                                                canvas.width = img.naturalWidth;
                                                canvas.height = img.naturalHeight;
                                                const ctx = canvas.getContext('2d');
                                                if (ctx) {
                                                  ctx.drawImage(img, 0, 0);
                                                  img.dataset.originalSrc = src;
                                                  img.src = canvas.toDataURL('image/png');
                                                  restoredImgs.push(img);
                                                }
                                              }
                                            } catch (e) { console.error(e); }
                                          }
                                        }

                                        // 蹂듭궗 踰꾪듉 ???④린湲?                                          const hooks = Array.from(targetEl.querySelectorAll('.copy-button-hook'));
                                          const hookDisplays = hooks.map(h => h.style.display);
                                          hooks.forEach(h => h.style.display = 'none');
                                          
                                          range.selectNodeContents(targetEl);
                                          selection.removeAllRanges();
                                          selection.addRange(range);
                                          
                                          document.execCommand('copy');
                                          
                                          selection.removeAllRanges();
                                          if (originalRange) selection.addRange(originalRange);
                                          
                                          // 蹂듭궗 踰꾪듉 ???먯긽 蹂듦뎄
                                          hooks.forEach((h, i) => h.style.display = hookDisplays[i]);
                                        
                                        // ?대?吏 URL ?먯긽 蹂듦뎄
                                        for (const img of restoredImgs) {
                                          if (img.dataset.originalSrc) {
                                            img.src = img.dataset.originalSrc;
                                            delete img.dataset.originalSrc;
                                          }
                                        }
                                        
                                        btn.innerHTML = '?쒖떇 蹂듭궗 ?꾨즺!';
                                        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
                                      } catch (err) {
                                        console.error("?쒖떇 蹂듭궗 ?ㅽ뙣:", err);
                                      }
                                    }}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/90 dark:bg-zinc-800/90 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-700 backdrop-blur-sm active:scale-95 transition-all"
                                    title="誘몃━蹂닿린 寃곌낵 蹂듭궗 (?쒖떇 ?ы븿)"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                                    蹂듭궗
                                  </button>
                                </div>
                                <MarkdownViewer
                                content={processedContent}
                                originalContent={content}
                                lineMap={lineMap}
                                onCheckboxToggle={handleCheckboxToggle}
                                currentFilePath={currentFileNode?.path}
                                rootFolderPath={rootFolder?.name}
                                onFileOpen={handleFileOpenByPath}
                                listIndent={activeProfile.rules.ul?.['padding-left'] || activeProfile.rules.ol?.['padding-left']}
                                marginTop={pTop}
                                marginBottom={pBottom}
                                marginLeft={pLeft}
                                marginRight={pRight}
                                bibContent={bibContent}
                                rootFolder={rootFolder}
                                resourceFolderHandle={resourceFolderHandle}
                                resourceFolder={resourceFolder}

                                workspaceType={workspaceType}
                              />
                            </div>
                          );
                        })()}
                        {/*
                   * ?숈쟻 CSS ?ㅽ????몄젥??
                   * custom-preview-container ?대????쒓렇?ㅼ뿉 CssRuleSet???곸슜?⑸땲??
                   * activeProfileId === 'default'硫?dynamicCssString??鍮?臾몄옄?댁씠誘濡?                   * ??<style> ?쒓렇???먮룞?쇰줈 ?앸왂?⑸땲??
                   * 紐⑤뱺 媛믪뿉 !important媛 遺숈뼱 prose ?대옒???ㅽ??쇱쓣 ?ㅻ쾭?쇱씠?쒗빀?덈떎.
                   */}
                        {dynamicCssString && (
                          <style dangerouslySetInnerHTML={{ __html: dynamicCssString }} />
                        )}
                        {/* 誘몃━蹂닿린 ?꾩슜 紐⑤뱶?닿굅??A4 議고뙋 媛?쒓? 耳쒖졇 ?덉쓣 ???ㅽ궓??諛곌꼍?됯낵 ?몃? 媛먯떥湲곗슜 ?뚯깋 諛곌꼍 遺꾨━ 吏??*/}
                        {(() => {
                          const activeProfile = profiles.find(p => p.id === activeProfileId) || DEFAULT_PROFILE;
                          const paperBg = activeProfile.pageStyle.backgroundColor || '#ffffff';
                          return (
                            <style dangerouslySetInnerHTML={{
                              __html: `
                        ${(previewMode === 'preview' || isA4GuardEnabled) ? `
                        .custom-preview-container {
                          background: ${isDarkMode ? '#13121a' : '#faf9f5'} !important;
                        }
                        ` : ''}
                        .preview-page-sheet {
                          background: ${paperBg} !important;
                          border-color: ${isDarkMode ? '#36343e' : '#e4e1ed'} !important;
                          box-shadow: none !important;
                        }
                      `}} />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                )
              )}

            </main>

            {isToolbarOpen && (
              <div className="no-print h-full w-12 flex flex-col justify-end bg-zinc-50 dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-700/60 pb-3">
                <Toolbar />
              </div>
            )}
          </div>

          <StatusBar />

          {isAIDraftModalOpen && (
            <AIDraftModal 
              onClose={() => setIsAIDraftModalOpen(false)} 
              onApply={handleAIDraftApply} 
              geminiApiKey={geminiApiKey || ''}
              aiModelName={aiModelName || 'gemini-1.5-flash'}
              initialMode={aiDraftInitialMode}
              editorContext={aiEditorContext}
              resourceFolder={resourceFolder}
                resourceFolderHandle={resourceFolderHandle}
            />
          )}

          {/* ?뮕 [Step 4 由ы뙥?좊쭅 ?꾨즺] 紐⑤뱺 紐⑤떖 猿띾뜲湲곕뱾??ModalManager濡??꾨꼍?섍쾶 ?닿? ?꾨즺! */}
          <ModalManager
            modals={{
              isSettingsModalOpen, setIsSettingsModalOpen,
              settingsModalInitialTab, setSettingsModalInitialTab,
              isStyleModalOpen, setIsStyleModalOpen,
              isExportModalOpen, setIsExportModalOpen,
              isImageModalOpen, setIsImageModalOpen,
              editingImageInfo, setEditingImageInfo,
              isMergeModalOpen, setIsMergeModalOpen,
              isYoutubeModalOpen, setIsYoutubeModalOpen,
              youtubeInitialUrl, setYoutubeInitialUrl,
              isLicenseModalOpen, setIsLicenseModalOpen,
              isHelpModalOpen, setIsHelpModalOpen,
              isFormulaModalOpen, setIsFormulaModalOpen,
              promptConfig, setPromptConfig,
              confirmConfig, setConfirmConfig,
              isMapModalOpen, setIsMapModalOpen,
              isTableModalOpen, setIsTableModalOpen,
              isReferenceModalOpen, setIsReferenceModalOpen,
              isCitationModalOpen, setIsCitationModalOpen
            }}
            deps={{
              isDarkMode, setIsDarkMode, fontSize, setFontSize, wordWrap, setWordWrap,
              autoSave, setAutoSave, rootFolder, selectRootFolder, driveLetter, setDriveLetter,
              workspaceType, setWorkspaceType, previewMode, setPreviewMode, customHotkeys, setCustomHotkeys,
              customSlashCommands, setCustomSlashCommands, licenseKey, setLicenseKey, themePalette, handleThemeChange,
              isActivated, autoClosingBrackets, setAutoClosingBrackets, geminiApiKey, setGeminiApiKey, aiModelName, setAiModelName,
              isActivated, licenseStatus, deviceId, handleSuccessActivation, handlers, content, currentFileNodeRef,
              setCurrentFileName, setCurrentFileNode, lastSavedContentRef, setSaveStatus, refreshFileList,
              showToast, editorRef, insertAtCursor, setIsMergeMode, selectedMergeNodes, setSelectedMergeNodes,
              handleFileClick, profiles, activeProfileId, dynamicCssString, setActiveProfileId: handleProfileChange, setProfiles,
              isSystemProfileId,
              getApiUrl,
              DEFAULT_PROFILE,
              SYSTEM_PROFILES,
              vfsCreateFile,
              vfsWriteFile,
              vfsCreateFolder,
              helpTitle, helpContent, setHelpContent,
              resourceFolder, resourceFolderRef, resourceFolderHandle, selectResourceFolder
            }}
          />



          {/* ?뵰 AI ?몃씪???꾨━酉?移대뱶 (?섎씫/痍⑥냼 ?덉쟾?μ튂) */}
          {aiPreviewState.isOpen && (() => {
            const handleApplyInsert = () => {
              const editor = editorRef.current;
              if (!editor || !aiPreviewState.originalRange) return;
              const monaco = (window as any).monaco;

              editor.executeEdits("AI_INSERT", [{
                range: aiPreviewState.originalRange,
                text: aiPreviewState.streamingText,
                forceMoveMarkers: true
              }]);

              // 諛붾?怨녹쑝濡??ㅽ겕濡?怨좎젙 諛??섏씠?쇱씠??              const lines = aiPreviewState.streamingText.split('\n');
              const startLine = aiPreviewState.originalRange.startLineNumber;
              const startCol = aiPreviewState.originalRange.startColumn;
              const endLine = startLine + lines.length - 1;
              const endCol = lines.length === 1 ? startCol + aiPreviewState.streamingText.length : lines[lines.length - 1].length + 1;
              const newRange = new monaco.Range(startLine, startCol, endLine, endCol);

              editor.setSelection(newRange);
              editor.revealRangeInCenter(newRange, 1);

              const newDeco = [{ range: newRange, options: { className: 'ai-changed-highlight', isWholeLine: false } }];
              aiDecorationsRef.current = editor.deltaDecorations(aiDecorationsRef.current, newDeco);
              setTimeout(() => {
                if (editorRef.current) aiDecorationsRef.current = editorRef.current.deltaDecorations(aiDecorationsRef.current, []);
              }, 1500);

              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("臾몄옣??蹂몃Ц???깃났?곸쑝濡??곸슜?섏뿀?듬땲?? (Ctrl+Z ?ㅽ뻾痍⑥냼 媛??", 'success');
            };

            const handleApplyAppend = () => {
              const editor = editorRef.current;
              const model = editor?.getModel();
              if (!editor || !model || !aiPreviewState.originalRange) return;
              const monaco = (window as any).monaco;

              const endLine = aiPreviewState.originalRange.endLineNumber;
              const endCol = model.getLineMaxColumn(endLine);
              const insertRange = new monaco.Range(endLine, endCol, endLine, endCol);

              let formattedText = '';
              if (aiPreviewState.action === 'summarize') {
                formattedText = `\n\n> ?뱷 **AI ?붿빟**:\n> ` + aiPreviewState.streamingText.replace(/\r?\n/g, '\n> ') + `\n`;
              } else {
                formattedText = `\n\n> ??**AI 媛怨?寃곌낵**:\n> ` + aiPreviewState.streamingText.replace(/\r?\n/g, '\n> ') + `\n`;
              }

              editor.executeEdits("AI_APPEND", [{
                range: insertRange,
                text: formattedText,
                forceMoveMarkers: true
              }]);

              // ?덈줈 異붽????꾩튂 怨꾩궛 諛??ъ빱???섏씠?쇱씠??              const lines = formattedText.split('\n');
              const startLine = endLine;
              const startCol = endCol;
              const endLineNum = startLine + lines.length - 1;
              const endColNum = lines.length === 1 ? startCol + formattedText.length : lines[lines.length - 1].length + 1;
              const newRange = new monaco.Range(startLine, startCol, endLineNum, endColNum);

              editor.setSelection(newRange);
              editor.revealRangeInCenter(newRange, 1);

              const newDeco = [{ range: newRange, options: { className: 'ai-changed-highlight', isWholeLine: false } }];
              aiDecorationsRef.current = editor.deltaDecorations(aiDecorationsRef.current, newDeco);
              setTimeout(() => {
                if (editorRef.current) aiDecorationsRef.current = editorRef.current.deltaDecorations(aiDecorationsRef.current, []);
              }, 1500);

              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("寃곌낵臾쇱씠 ?꾨옯以꾩뿉 ?㏓텤?ъ죱?듬땲?? (Ctrl+Z ?ㅽ뻾痍⑥냼 媛??", 'success');
            };

            const handleCancel = () => {
              generationIdRef.current++;
              setAiPreviewState(prev => ({ ...prev, isOpen: false }));
              showToast("AI 寃곌낵媛 痍⑥냼?섏뿀?듬땲??", 'info');
            };

            return (
              <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[99999] w-[90%] max-w-xl bg-white dark:bg-zinc-900 shadow-2xl rounded-2xl border border-purple-500/20 p-4 flex flex-col gap-3 animate-in slide-in-from-bottom-5 duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles size={16} className="text-purple-500 animate-pulse" />
                    <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">
                      AI 媛怨?寃곌낵 ?꾨━酉?({aiPreviewState.action.toUpperCase()})
                    </span>
                  </div>
                  {!aiPreviewState.isFinished && (
                    <span className="text-[11px] font-bold text-purple-500/80 animate-pulse bg-purple-500/10 px-2 py-0.5 rounded-full">
                      湲???앹꽦 以?..
                    </span>
                  )}
                </div>

                <div
                  className="text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-950/80 text-slate-800 dark:text-zinc-200 overflow-y-auto whitespace-pre-wrap select-text cursor-text min-h-[80px]"
                  style={{ maxHeight: '180px' }}
                >
                  {aiPreviewState.streamingText ? (
                    <span className="w-full text-left">{aiPreviewState.streamingText}</span>
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 py-4 select-none">
                      <Loader2 className="animate-spin text-purple-500" size={20} />
                      <span className="text-slate-500 dark:text-zinc-400 italic text-[11px] font-bold animate-pulse">
                        AI媛 理쒖쟻??臾몄옣 援ъ“瑜?媛怨듯븯??以묒엯?덈떎...
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium">
                    Ctrl+Z濡?蹂몃Ц 移섑솚 ??利됱떆 ?먮났?????덉뒿?덈떎.
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={handleCancel}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
                    >
                      痍⑥냼
                    </button>
                    <button
                      onClick={handleApplyAppend}
                      disabled={!aiPreviewState.streamingText}
                      className="px-3 py-1.5 text-xs font-bold rounded-lg border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15 text-purple-600 dark:text-purple-400 disabled:opacity-40 transition-colors"
                    >
                      ?꾨옒??異붽?
                    </button>
                    <button
                      onClick={handleApplyInsert}
                      disabled={!aiPreviewState.streamingText}
                      className="px-4 py-1.5 text-xs font-bold rounded-lg text-white bg-purple-600 hover:bg-purple-700 disabled:opacity-40 transition-opacity"
                    >
                      蹂몃Ц???곸슜
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ?럺截?紐⑤컮???뚮줈???뚯꽦 鍮꾩꽌 (STT) */}
          {mounted && isMobile && (() => {
            const handleSpeechToText = () => {
              const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
              if (!SpeechRecognition) {
                showToast("二꾩넚?⑸땲?? ?꾩옱 釉뚮씪?곗????뚯꽦 ?몄떇??吏?먰븯吏 ?딆뒿?덈떎.", 'error');
                return;
              }

              if (isRecording) {
                // ?뱀쓬 以묒?
                setIsRecording(false);
                return;
              }

              const recognition = new SpeechRecognition();
              recognition.lang = 'ko-KR';
              recognition.interimResults = false;
              recognition.maxAlternatives = 1;

              recognition.onstart = () => {
                setIsRecording(true);
                showToast("?럺截?留덉씠?ш? 耳쒖죱?듬땲?? 留먯???二쇱꽭??..", 'info');
              };

              recognition.onerror = (e: any) => {
                console.error('Speech recognition error:', e);
                setIsRecording(false);
                showToast("?뚯꽦 ?몄떇???ㅽ뙣?덉뒿?덈떎.", 'error');
              };

              recognition.onend = () => {
                setIsRecording(false);
              };

              recognition.onresult = async (event: any) => {
                const transcript = event.results[0][0].transcript;
                if (!transcript.trim()) return;

                showToast(`?뚯꽦 媛먯?: "${transcript}"`, 'success');

                // ?뚯꽦??AI ?ㅻ벉湲?POLISH)濡?媛怨듯븯???먮뵒?곗뿉 二쇱엯
                if (!geminiApiKey) {
                  // API Key媛 ?놁쑝硫??먮낯 ?뚯꽦 ?띿뒪?몃씪??蹂몃Ц??吏곸젒 ?쎌엯
                  insertAtCursor(transcript);
                  showToast("API ?ㅺ? ?ㅼ젙?섏뼱 ?덉? ?딆븘 ?먮낯 ?뚯꽦??洹몃?濡??낅젰?덉뒿?덈떎.", 'info');
                  return;
                }

                // 媛吏??뚮뜑留?踰붿쐞 ?앹꽦 ??AI ?ㅽ듃由щ컢 援щ룞
                const editor = editorRef.current;
                if (!editor) return;
                const model = editor.getModel();
                if (!model) return;
                const pos = editor.getPosition() || { lineNumber: 1, column: 1 };
                const dummyRange = new ((window as any).monaco).Range(pos.lineNumber, pos.column, pos.lineNumber, pos.column);

                const currentGenId = ++generationIdRef.current;

                setAiPreviewState({
                  isOpen: true,
                  originalRange: dummyRange,
                  streamingText: '',
                  action: 'polish',
                  originalText: transcript,
                  isFinished: false
                });

                try {
                  await processTextWithAIStream(
                    geminiApiKey,
                    aiModelName,
                    `??援ъ뼱泥??뚯꽦??源붾걫?섍퀬 ?뺢컝??怨듭?湲 ?먮뒗 ?ㅻ챸湲 ?쒗뵆由우쑝濡?媛怨듯빐以? "${transcript}"`,
                    'polish',
                    (chunkText) => {
                      if (currentGenId !== generationIdRef.current) return;
                      setAiPreviewState(prev => ({ ...prev, streamingText: chunkText }));
                    }
                  );
                  if (currentGenId !== generationIdRef.current) return;
                  setAiPreviewState(prev => ({ ...prev, isFinished: true }));
                } catch (err: any) {
                  if (currentGenId !== generationIdRef.current) return;
                  showToast("?뚯꽦 媛怨??붿껌 ?ㅽ뙣", 'error');
                  setAiPreviewState(prev => ({ ...prev, isOpen: false }));
                }
              };

              recognition.start();
            };

            return (
              <button
                onClick={handleSpeechToText}
                className={`fixed bottom-20 right-6 z-[99999] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-2xl transition-transform hover:scale-105 active:scale-95 cursor-pointer ${isRecording ? 'bg-rose-500 mic-pulse' : 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-500/20'}`}
              >
                {isRecording ? (
                  <span className="w-4 h-4 bg-white rounded-full animate-ping" />
                ) : (
                  <span className="text-xl">?럺截?/span>
                )}
              </button>
            );
          })()}

          {isAiLoading && (
            <div className="fixed inset-0 z-[99999] bg-black/25 dark:bg-black/55 flex items-center justify-center pointer-events-none select-none">
              <div className="bg-white dark:bg-zinc-800 shadow-2xl border border-purple-500/20 rounded-2xl px-6 py-4 flex items-center gap-3.5 animate-in fade-in zoom-in-95 duration-200">
                <Loader2 className="animate-spin text-purple-500" size={20} />
                <span className="text-[13px] font-bold text-zinc-700 dark:text-zinc-200">
                  AI媛 臾몄옣???ㅻ벉怨??덉뒿?덈떎...
                </span>
              </div>
            </div>
          )}
        </div>
      </EditorProvider>
    </>
  );
}



