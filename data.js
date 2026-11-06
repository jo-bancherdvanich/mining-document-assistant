// Made-up sample library for the prototype. All files, sites and figures are fictional.
// The word "gold" appears only in records whose commodity is gold, which keeps
// the main demo question at exactly 15 results.

export const CATEGORIES = [
  "Gold Mining Plan",
  "Haul Truck",
  "Mine Design & Scheduling",
  "Geotechnical Engineering",
  "Drill & Blast",
  "Processing Plant Engineering",
  "Tailings Engineering",
  "Equipment & Maintenance",
];

const [PLAN, HAUL, DESIGN, GEOTECH, BLAST, PLANT, TAILINGS, EQUIPMENT] = CATEGORIES;

// The file type and year come from the file name, so they can't disagree with it.
const file = (name, category, commodity, site, passage) => ({
  name,
  type: name.split(".").pop(),
  category,
  year: Number(name.match(/_(\d{4})\./)[1]),
  commodity,
  site,
  passage,
});

export const FILES = [
  // Gold Mining Plan
  file("Gold_Mine_Plan_Summary_2016.pdf", PLAN, "gold", "Harlow Ridge", "Summarizes the eleven-year gold mine plan at Harlow Ridge, targeting 180,000 ounces per year at a 2.4 g/t head grade."),
  file("Gold_Mining_Plan_Phase_1_2015.docx", PLAN, "gold", "Tarn Basin", "Sets out the first gold mining phase at Tarn Basin, including pre-strip volumes and the mining sequence for the east pit."),
  file("Gold_Pit_Production_Schedule_2017.xlsx", PLAN, "gold", "Harlow Ridge", "Quarterly gold production schedule with ore tonnes, waste tonnes and strip ratio for each pit stage."),
  file("Gold_Mining_Plan_Update_2016.docx", PLAN, "gold", "Corvane Hill", "Updates the gold mining plan at Corvane Hill after infill drilling added 14 months to the mine life."),
  file("Gold_Mining_Plan_Scoping_2014.pdf", PLAN, "gold", "Mirren Flats", "Early scoping review of gold mining options at Mirren Flats, comparing open pit and underground methods."),
  file("Gold_Mining_Plan_Extension_2019.pdf", PLAN, "gold", "Harlow Ridge", "Evaluates a four-year gold mining extension through a pit cutback on the western wall."),

  // Haul Truck
  file("Haul_Truck_Fleet_Sizing_2015.xlsx", HAUL, "gold", "Tarn Basin", "Fleet sizing model for the gold operation at Tarn Basin, recommending 14 trucks of 136-tonne payload."),
  file("Haul_Road_Design_Review_2016.docx", HAUL, "gold", "Harlow Ridge", "Reviews haul road width, grade and drainage at the Harlow Ridge gold mine against a 10 percent maximum ramp grade."),
  file("Haul_Truck_Cycle_Time_Study_2017.pdf", HAUL, "gold", "Corvane Hill", "Measures truck cycle times at the Corvane Hill gold pit and finds queuing at the shovel adds 2.1 minutes per load."),
  file("Haul_Truck_Payload_Analysis_2018.xlsx", HAUL, "copper", "Mirren Flats", "Analyzes payload scale data from the copper fleet and identifies 8 percent of loads above the target range."),
  file("Haul_Truck_Tyre_Life_Review_2014.pdf", HAUL, "iron ore", "Tarn Basin", "Compares tyre life across haul routes and links early failures to rock spillage on the main ramp."),
  file("Haul_Road_Maintenance_Schedule_2020.docx", HAUL, "coal", "Corvane Hill", "Sets grader and water cart schedules to keep rolling resistance below 3 percent on coal haul roads."),

  // Mine Design & Scheduling
  file("Open_Pit_Design_Review_2017.docx", DESIGN, "gold", "Harlow Ridge", "Reviews the final gold pit design, including bench heights, berm widths and ramp placement."),
  file("Underground_Stope_Design_2016.pdf", DESIGN, "gold", "Tarn Basin", "Designs long-hole stopes for the gold orebody below the Tarn Basin pit, with 25-metre sublevel spacing."),
  file("Pit_Optimization_Model_2013.xlsx", DESIGN, "copper", "Mirren Flats", "Pit shell optimization results for the copper deposit across five metal price cases."),
  file("Mine_Schedule_Update_2018.xlsx", DESIGN, "iron ore", "Corvane Hill", "Updated life-of-mine schedule balancing ore blending targets across three iron ore pits."),
  file("Pit_Phase_Sequencing_2015.docx", DESIGN, "coal", "Tarn Basin", "Recommends a four-phase coal pit sequence to defer waste stripping during the first five years."),
  file("Waste_Dump_Layout_2019.pdf", DESIGN, "copper", "Mirren Flats", "Lays out waste dump lifts and truck routes to shorten the average haul by 600 metres."),

  // Geotechnical Engineering
  file("Pit_Slope_Stability_Study_2016.pdf", GEOTECH, "gold", "Corvane Hill", "Slope stability analysis for the gold pit, recommending a 42-degree overall angle on the north wall."),
  file("Ground_Support_Design_2015.docx", GEOTECH, "gold", "Tarn Basin", "Specifies bolt and mesh patterns for the gold decline based on rock mass quality mapping."),
  file("Slope_Monitoring_Data_2017.xlsx", GEOTECH, "copper", "Mirren Flats", "Monthly radar and prism readings for the east wall, showing movement within trigger levels."),
  file("Rock_Mass_Characterization_2014.pdf", GEOTECH, "iron ore", "Corvane Hill", "Classifies rock mass domains from 2,300 metres of oriented core drilling."),
  file("Highwall_Stability_Review_2018.docx", GEOTECH, "coal", "Tarn Basin", "Assesses highwall stability after a seam dip change and recommends a wider catch bench."),
  file("Underground_Pillar_Design_2020.pdf", GEOTECH, "copper", "Harlow Ridge", "Calculates pillar sizes and safety factors for the room-and-pillar copper section."),

  // Drill & Blast
  file("Blast_Pattern_Optimization_2017.xlsx", BLAST, "gold", "Harlow Ridge", "Tests burden and spacing options in gold ore, with a 3.8 by 4.4 metre pattern giving the best fragmentation."),
  file("Blast_Vibration_Study_2015.pdf", BLAST, "copper", "Mirren Flats", "Measures ground vibration from production blasts and sets maximum charge weights per delay."),
  file("Drill_Productivity_Review_2016.docx", BLAST, "iron ore", "Tarn Basin", "Compares penetration rates across hard ore zones and recommends a change of bit type."),
  file("Fragmentation_Analysis_2018.xlsx", BLAST, "gold", "Corvane Hill", "Photo-analysis of blasted gold ore shows a P80 of 410 millimetres at the crusher feed."),
  file("Explosives_Usage_Model_2014.xlsx", BLAST, "coal", "Mirren Flats", "Models powder factor and explosives cost for overburden blasting by bench."),
  file("Presplit_Blast_Design_2019.pdf", BLAST, "iron ore", "Corvane Hill", "Designs a presplit line for final walls to reduce back-break and protect the berm."),

  // Processing Plant Engineering
  file("Mill_Throughput_Model_2017.xlsx", PLANT, "gold", "Harlow Ridge", "Models gold mill throughput at 2.6 million tonnes per year and identifies the ball mill as the bottleneck."),
  file("Carbon_In_Leach_Circuit_Review_2016.pdf", PLANT, "gold", "Tarn Basin", "Reviews the carbon-in-leach circuit and estimates a 1.5 percent gold recovery gain from longer residence time."),
  file("Copper_Flotation_Circuit_Design_2015.docx", PLANT, "copper", "Mirren Flats", "Sizes rougher and cleaner flotation cells for a 91 percent copper recovery target."),
  file("Iron_Ore_Beneficiation_Study_2018.pdf", PLANT, "iron ore", "Corvane Hill", "Compares jigging and magnetic separation for upgrading low-grade iron ore."),
  file("Coal_Wash_Plant_Upgrade_2013.docx", PLANT, "coal", "Tarn Basin", "Scopes a wash plant upgrade to lift clean coal yield by 4 percent."),
  file("Crushing_Circuit_Expansion_2020.xlsx", PLANT, "copper", "Mirren Flats", "Equipment list and capacity calculations for adding a secondary crushing stage."),

  // Tailings Engineering
  file("Tailings_Dam_Design_Report_2015.pdf", TAILINGS, "gold", "Harlow Ridge", "Design report for the gold tailings dam, with a downstream raise to 38 metres and a 12-year capacity."),
  file("Tailings_Beach_Monitoring_2016.xlsx", TAILINGS, "copper", "Mirren Flats", "Tracks beach length, pond level and piezometer readings at the tailings storage facility."),
  file("Tailings_Seepage_Analysis_2014.docx", TAILINGS, "gold", "Tarn Basin", "Models seepage through the gold tailings embankment and recommends a toe drain."),
  file("Tailings_Filtration_Study_2018.pdf", TAILINGS, "iron ore", "Corvane Hill", "Tests filter pressing to produce dry-stack tailings with 16 percent moisture."),
  file("Tailings_Storage_Expansion_2017.docx", TAILINGS, "coal", "Tarn Basin", "Options study for expanding fine tailings storage by 5 million cubic metres."),
  file("Tailings_Water_Balance_2019.xlsx", TAILINGS, "copper", "Harlow Ridge", "Monthly water balance for the tailings facility, including decant return and evaporation."),

  // Equipment & Maintenance
  file("Crusher_Maintenance_Schedule_2016.docx", EQUIPMENT, "copper", "Mirren Flats", "Sets inspection intervals and liner change-out schedules for the primary crusher."),
  file("Excavator_Rebuild_Schedule_2015.xlsx", EQUIPMENT, "iron ore", "Corvane Hill", "Schedules component rebuilds for the excavator fleet based on operating hours."),
  file("Conveyor_Reliability_Study_2017.pdf", EQUIPMENT, "coal", "Tarn Basin", "Analyzes conveyor downtime and traces 40 percent of stoppages to belt tracking faults."),
  file("Mill_Liner_Replacement_Shutdown_2018.docx", EQUIPMENT, "gold", "Harlow Ridge", "Plans a 72-hour shutdown to replace liners in the gold plant's ball mill."),
  file("Pump_Fleet_Condition_Review_2014.pdf", EQUIPMENT, "copper", "Mirren Flats", "Condition survey of dewatering pumps, ranking units for repair or replacement."),
  file("Drill_Rig_Maintenance_Costs_2019.xlsx", EQUIPMENT, "iron ore", "Corvane Hill", "Breaks down drill rig maintenance cost per metre drilled by component group."),
];
