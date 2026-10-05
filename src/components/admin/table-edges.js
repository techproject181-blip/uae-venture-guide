// A .doc-table inside a TablePanel: the first and last columns line up with
// the panel's header row (20px in from the edge on phones, 24px from 640px)
// instead of the table's own 16px.
export const tableEdges =
  "[&_td:first-child]:pl-5 [&_th:first-child]:pl-5 sm:[&_td:first-child]:pl-6 sm:[&_th:first-child]:pl-6 [&_td:last-child]:pr-5 [&_th:last-child]:pr-5 sm:[&_td:last-child]:pr-6 sm:[&_th:last-child]:pr-6";
