// The ChatsConnect mark — the same drawing as public/logo.svg, in the current text colour
export default function LogoMark({ className }) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      aria-hidden="true"
    >
      <path d="M3 17V3h14M61 47v14H47" />
      <path d="M13 15h38v27H31l-11 9v-9h-7z" fill="currentColor" fillOpacity=".1" />
      <path d="M21 23l6 5.5-6 5.5" strokeLinecap="square" />
      <rect x="31" y="31" width="11" height="4" fill="currentColor" stroke="none" />
    </svg>
  );
}
