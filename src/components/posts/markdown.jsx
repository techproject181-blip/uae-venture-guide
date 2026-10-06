import ReactMarkdown from "react-markdown";

// Renders a post's Markdown. skipHtml drops any raw HTML in the text, so a post
// cannot add scripts or markup to the page.

/** Builds a styled element, leaving out the `node` prop react-markdown passes along. */
const styled = (Tag, className) =>
  function Styled({ node: _node, ...props }) {
    return <Tag className={className} {...props} />;
  };

const components = {
  h1: styled("h2", "mt-8 mb-3 text-2xl"),
  h2: styled("h2", "mt-8 mb-3 text-xl"),
  h3: styled("h3", "mt-6 mb-2 text-lg"),
  p: styled("p", "my-4 leading-relaxed"),
  ul: styled("ul", "my-4 list-disc space-y-1 pl-6 marker:text-muted-foreground"),
  ol: styled("ol", "my-4 list-decimal space-y-1 pl-6 marker:text-muted-foreground"),
  blockquote: styled("blockquote", "my-4 border-l-2 border-foreground/30 pl-4 text-muted-foreground"),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="font-medium text-foreground decoration-primary underline underline-offset-4 hover:decoration-2"
    >
      {children}
    </a>
  ),
  img: () => null, // pictures belong in the picture fields, which require a description
};

export function Markdown({ children }) {
  return (
    <ReactMarkdown components={components} skipHtml>
      {children}
    </ReactMarkdown>
  );
}
