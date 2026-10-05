import { Panel } from "@/components/layout";

const TIPS = [
  "Tell one real story: what you tried, what it cost and what you would do differently.",
  "Name the emirate, licence or free zone when it matters. Founders search for those.",
  "Short paragraphs and a few headings make a long post easy to read on a phone.",
  "Add a chart when numbers tell the story, such as costs in your first year.",
];

const MARKDOWN = [
  { type: "## A heading", shows: "A heading" },
  { type: "**bold words**", shows: "bold words", className: "font-semibold" },
  { type: "- one point", shows: "• one point" },
  { type: "1. first step", shows: "1. first step" },
  { type: "> a quote", shows: "a quote", className: "border-l-2 border-foreground/30 pl-2 text-muted-foreground" },
  { type: "[text](https://…)", shows: "text", className: "underline decoration-primary underline-offset-4" },
];

/** The aside of the post form: writing tips, Markdown help and who reads the post. */
export function PostFormHelp() {
  return (
    <>
      <Panel title="Writing tips">
        <ul className="space-y-3 text-sm text-muted-foreground">
          {TIPS.map((tip) => (
            <li key={tip} className="flex gap-2.5">
              <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Markdown help" description="Type the marks on the left in “Your story”." flush>
        <table className="doc-table">
          <thead>
            <tr>
              <th scope="col">You type</th>
              <th scope="col">Readers see</th>
            </tr>
          </thead>
          <tbody>
            {MARKDOWN.map((row) => (
              <tr key={row.type}>
                <td className="font-mono text-[0.8125rem] whitespace-nowrap">{row.type}</td>
                <td>
                  <span className={row.className}>{row.shows}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="border-t px-5 py-4 text-sm text-muted-foreground sm:px-6">
          HTML and pictures typed in the text are left out. Add pictures in the picture fields, with a description.
        </p>
      </Panel>

      <Panel title="Who reads it">
        <p className="text-sm text-muted-foreground">
          Published posts are public: anyone can read them on the Experience posts page, signed in or not. An administrator can hide a post
          that breaks the rules.
        </p>
      </Panel>
    </>
  );
}
