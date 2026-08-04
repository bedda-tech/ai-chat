import assert from "node:assert/strict";
import {
  type Feature,
  type FeaturePriority,
  type FeatureStatus,
  roadmapData,
  roadmapStats,
} from "./roadmap-data";

const VALID_STATUSES: FeatureStatus[] = ["planned", "in-progress", "completed"];
const VALID_PRIORITIES: FeaturePriority[] = [
  "critical",
  "high",
  "medium",
  "low",
];

function allFeatures(): Feature[] {
  return roadmapData.flatMap((phase) => phase.features);
}

function testPhaseIdsAreUnique() {
  const ids = roadmapData.map((phase) => phase.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "phase ids should all be unique"
  );
}

function testFeatureIdsAreUniqueAcrossPhases() {
  const ids = allFeatures().map((f) => f.id);
  assert.equal(
    new Set(ids).size,
    ids.length,
    "feature ids should all be unique across every phase"
  );
}

function testEveryFeatureHasAValidStatus() {
  for (const feature of allFeatures()) {
    assert.ok(
      VALID_STATUSES.includes(feature.status),
      `feature ${feature.id} has unrecognized status "${feature.status}"`
    );
  }
}

function testEveryFeatureHasAValidPriority() {
  for (const feature of allFeatures()) {
    assert.ok(
      VALID_PRIORITIES.includes(feature.priority),
      `feature ${feature.id} has unrecognized priority "${feature.priority}"`
    );
  }
}

function testRoadmapStatsMatchActualFeatureCounts() {
  const features = allFeatures();
  assert.equal(
    roadmapStats.totalFeatures,
    features.length,
    "roadmapStats.totalFeatures should equal the actual number of features across all phases"
  );
  assert.equal(
    roadmapStats.completedFeatures,
    features.filter((f) => f.status === "completed").length,
    "roadmapStats.completedFeatures should equal the actual count of completed features"
  );
  assert.equal(
    roadmapStats.inProgressFeatures,
    features.filter((f) => f.status === "in-progress").length,
    "roadmapStats.inProgressFeatures should equal the actual count of in-progress features"
  );
  assert.equal(
    roadmapStats.plannedFeatures,
    features.filter((f) => f.status === "planned").length,
    "roadmapStats.plannedFeatures should equal the actual count of planned features"
  );
}

function testStatsCountsSumToTotal() {
  assert.equal(
    roadmapStats.completedFeatures +
      roadmapStats.inProgressFeatures +
      roadmapStats.plannedFeatures,
    roadmapStats.totalFeatures,
    "completed + in-progress + planned should sum to totalFeatures"
  );
}

function testEveryFeatureHasNonEmptyCoreFields() {
  for (const feature of allFeatures()) {
    assert.ok(
      feature.title.trim().length > 0,
      `feature ${feature.id} should have a non-empty title`
    );
    assert.ok(
      feature.description.trim().length > 0,
      `feature ${feature.id} should have a non-empty description`
    );
    assert.ok(
      feature.effort.trim().length > 0,
      `feature ${feature.id} should have a non-empty effort`
    );
  }
}

function main() {
  const tests: [string, () => void][] = [
    ["phase ids are all unique", testPhaseIdsAreUnique],
    [
      "feature ids are unique across every phase",
      testFeatureIdsAreUniqueAcrossPhases,
    ],
    ["every feature has a valid status", testEveryFeatureHasAValidStatus],
    ["every feature has a valid priority", testEveryFeatureHasAValidPriority],
    [
      "roadmapStats matches the actual feature counts",
      testRoadmapStatsMatchActualFeatureCounts,
    ],
    [
      "roadmapStats status counts sum to totalFeatures",
      testStatsCountsSumToTotal,
    ],
    [
      "every feature has non-empty title/description/effort",
      testEveryFeatureHasNonEmptyCoreFields,
    ],
  ];

  let failures = 0;
  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`PASS: ${name}`);
    } catch (err) {
      failures++;
      console.error(`FAIL: ${name}`);
      console.error(err);
    }
  }

  if (failures > 0) {
    console.error(`${failures}/${tests.length} tests failed`);
    process.exit(1);
  }
  console.log(`All ${tests.length} tests passed`);
}

main();
