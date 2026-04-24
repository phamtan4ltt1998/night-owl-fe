function SVG({ d, size=18, fill='none', stroke='currentColor', sw=1.7, vb='0 0 24 24', style={} }) {
  return (
    <svg width={size} height={size} viewBox={vb} fill={fill} stroke={stroke} strokeWidth={sw}
      strokeLinecap="round" strokeLinejoin="round" style={style}>
      {Array.isArray(d) ? d.map((p,i) => <path key={i} d={p}/>) : <path d={d}/>}
    </svg>
  );
}

export const Icons = {
  home:        s => <SVG size={s} d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10"/>,
  compass:     s => <SVG size={s} d={['M12 2a10 10 0 100 20A10 10 0 0012 2z','M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z']}/>,
  library:     s => <SVG size={s} d={['M4 19.5A2.5 2.5 0 016.5 17H20','M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z']}/>,
  bookmark:    s => <SVG size={s} d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/>,
  headphones:  s => <SVG size={s} d={['M3 18v-6a9 9 0 0118 0v6','M21 19a2 2 0 01-2 2h-1a2 2 0 01-2-2v-3a2 2 0 012-2h3zM3 19a2 2 0 002 2h1a2 2 0 002-2v-3a2 2 0 00-2-2H3z']}/>,
  user:        s => <SVG size={s} d={['M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2','M12 3a4 4 0 100 8 4 4 0 000-8z']}/>,
  search:      s => <SVG size={s} d={['M11 19a8 8 0 100-16 8 8 0 000 16z','M21 21l-4.35-4.35']}/>,
  star:        s => <SVG size={s} fill="currentColor" stroke="none" d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>,
  fire:        s => <SVG size={s} fill="currentColor" stroke="none" vb="0 0 24 24" d="M12 23c-4.97 0-9-4.03-9-9 0-4.17 2.84-7.67 6.75-8.65.87-.22 1.58.6 1.35 1.49-.14.52-.21 1.07-.1 1.6.2.99.89 1.82 1.72 2.32C13.87 11.5 15 10.26 15 8.75c0-.69-.2-1.36-.55-1.93-.23-.38-.07-.89.36-1.01C18.25 6.78 21 10.06 21 14c0 4.97-4.03 9-9 9z"/>,
  play:        s => <SVG size={s} fill="currentColor" stroke="none" d="M5 3l14 9-14 9V3z"/>,
  pause:       s => <SVG size={s} fill="currentColor" stroke="none" d={['M6 4h4v16H6z','M14 4h4v16h-4z']}/>,
  back:        s => <SVG size={s} d="M19 12H5M12 19l-7-7 7-7"/>,
  chevronRight:s => <SVG size={s} d="M9 18l6-6-6-6"/>,
  chevronLeft: s => <SVG size={s} d="M15 18l-6-6 6-6"/>,
  chevronDown: s => <SVG size={s} d="M6 9l6 6 6-6"/>,
  moon:        s => <SVG size={s} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>,
  sun:         s => <SVG size={s} d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 17a5 5 0 100-10 5 5 0 000 10z"/>,
  settings:    s => <SVG size={s} d="M12 15a3 3 0 100-6 3 3 0 000 6zM19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>,
  lock:        s => <SVG size={s} d={['M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z','M7 11V7a5 5 0 0110 0v4']}/>,
  check:       s => <SVG size={s} d="M20 6L9 17l-5-5" sw={2.5}/>,
  volume:      s => <SVG size={s} d={['M11 5L6 9H2v6h4l5 4V5z','M15.54 8.46a5 5 0 010 7.07','M19.07 4.93a10 10 0 010 14.14']}/>,
  close:       s => <SVG size={s} d={['M18 6L6 18','M6 6l12 12']} sw={2}/>,
  eye:         s => <SVG size={s} d={['M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z','M12 9a3 3 0 100 6 3 3 0 000-6z']}/>,
  bell:        s => <SVG size={s} d={['M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9','M13.73 21a2 2 0 01-3.46 0']}/>,
  edit:        s => <SVG size={s} d={['M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7','M18.5 2.5a2.12 2.12 0 013 3L12 15l-4 1 1-4 9.5-9.5z']}/>,
  creditCard:  s => <SVG size={s} d={['M1 4h22v16H1z','M1 10h22']} vb="0 0 24 24"/>,
  skip:        s => <SVG size={s} fill="currentColor" stroke="none" d="M6 4l10 8-10 8V4zm11 0h2v16h-2z"/>,
  skipBack:    s => <SVG size={s} fill="currentColor" stroke="none" d="M18 4L8 12l10 8V4zM5 4H7v16H5z"/>,
  repeat:      s => <SVG size={s} d={['M17 1l4 4-4 4','M3 11V9a4 4 0 014-4h14','M7 23l-4-4 4-4','M21 13v2a4 4 0 01-4 4H3']}/>,
  shuffle:     s => <SVG size={s} d={['M16 3h5v5','M4 20L21 3','M21 16v5h-5','M15 15l6 6','M4 4l5 5']}/>,
  globe:       s => <SVG size={s} d={['M12 2a10 10 0 100 20A10 10 0 0012 2z','M2 12h20','M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z']}/>,
};
