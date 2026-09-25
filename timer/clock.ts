// Timer mechanism depth (altitude) — tick logic / format / adapter call lifted out of render loop
export function fmtMs(ms: number) { return Math.floor(ms/60000)+":"+(String(Math.floor(ms/60000)%60)).padStart(2,"0"); }
export function initBaseStr(): string { return localStorage.getItem("timer-base") || new Date().toISOString(); }
