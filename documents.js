// Made-up document content for the prototype's file view. No real files exist.

const CATEGORY_CONTENT = {
  "Gold Mining Plan": {
    method: "Mining sequence, production rates and waste movement were reviewed against the current resource model and site constraints.",
    outcome: "The plan sets out the recommended mining sequence and the work needed before the next planning update.",
    rows: [
      ["Resource model", "Reviewed", "Latest model used for scheduling"],
      ["Mining sequence", "Complete", "Stages ordered by access and ore value"],
      ["Waste movement", "Complete", "Dump capacity checked for each stage"],
    ],
  },
  "Haul Truck": {
    method: "Fleet data, road conditions and cycle records were reviewed against the target production rate.",
    outcome: "The review identifies the main constraints on haulage and the changes most likely to improve fleet performance.",
    rows: [
      ["Fleet records", "Reviewed", "Dispatch and payload data checked"],
      ["Haul routes", "Complete", "Grades and distances confirmed"],
      ["Operating delays", "Complete", "Main causes ranked by lost time"],
    ],
  },
  "Mine Design & Scheduling": {
    method: "Design parameters and schedule assumptions were checked against geotechnical limits and production targets.",
    outcome: "The study recommends the design and sequence that best balance access, cost and schedule risk.",
    rows: [
      ["Design parameters", "Reviewed", "Checked against current limits"],
      ["Schedule assumptions", "Complete", "Rates aligned with fleet capacity"],
      ["Access and sequence", "Complete", "Options compared by stage"],
    ],
  },
  "Geotechnical Engineering": {
    method: "Rock mass data, structural mapping and stability calculations were reviewed for the area studied.",
    outcome: "The study sets the recommended design limits and the monitoring needed to confirm them during operation.",
    rows: [
      ["Rock mass data", "Reviewed", "Mapping and core logs included"],
      ["Stability analysis", "Complete", "Design cases checked"],
      ["Monitoring plan", "Complete", "Inspection and trigger levels defined"],
    ],
  },
  "Drill & Blast": {
    method: "Blast designs, drilling records and field results were compared to find the most effective practice.",
    outcome: "The review recommends design changes and field checks to make blast results more consistent.",
    rows: [
      ["Blast designs", "Reviewed", "Patterns compared by rock type"],
      ["Drilling records", "Complete", "Accuracy and rates checked"],
      ["Field results", "Complete", "Results compared with design"],
    ],
  },
  "Processing Plant Engineering": {
    method: "Plant data, test work and equipment capacities were reviewed against the design throughput.",
    outcome: "The review identifies the main process constraints and the upgrades worth taking to detailed design.",
    rows: [
      ["Plant data", "Reviewed", "Operating records checked"],
      ["Test work", "Complete", "Results compared with design basis"],
      ["Equipment capacity", "Complete", "Bottlenecks ranked by impact"],
    ],
  },
  "Tailings Engineering": {
    method: "Facility design, monitoring records and water management were reviewed against the design criteria.",
    outcome: "The review sets out the recommended actions and monitoring for the next stage of the facility.",
    rows: [
      ["Design criteria", "Reviewed", "Checked against current basis"],
      ["Monitoring records", "Complete", "Instrument readings included"],
      ["Water management", "Complete", "Inflows and returns reviewed"],
    ],
  },
  "Equipment & Maintenance": {
    method: "Maintenance history, condition data and failure records were reviewed for the equipment studied.",
    outcome: "The plan recommends maintenance priorities that reduce unplanned downtime.",
    rows: [
      ["Maintenance history", "Reviewed", "Work orders checked"],
      ["Condition data", "Complete", "Inspection results included"],
      ["Failure records", "Complete", "Main causes ranked by downtime"],
    ],
  },
};

const capitalize = (text) => text[0].toUpperCase() + text.slice(1);

export function buildDocumentPreview(file) {
  const { method, outcome, rows } = CATEGORY_CONTENT[file.category];
  return {
    title: file.name.replace(/\.[^.]+$/, "").replaceAll("_", " "),
    details: [
      ["File", file.name],
      ["Category", file.category],
      ["Year", String(file.year)],
      ["Company", file.site],
      ["Commodity", capitalize(file.commodity)],
    ],
    overview: file.passage,
    sections: [
      { heading: "Method", text: method },
      { heading: "Outcome", text: outcome },
    ],
    table: {
      title: file.type === "xlsx" ? "Sheet 1: Review items" : "Review items",
      headers: ["Item", "Status", "Notes"],
      rows,
    },
  };
}
