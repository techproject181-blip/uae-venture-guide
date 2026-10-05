/** Each page in this part of the app slides in softly when it opens (see .page-enter in globals.css). */
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}
