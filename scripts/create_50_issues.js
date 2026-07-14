const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const issues1 = JSON.parse(fs.readFileSync(path.join(__dirname, "issues1.json"), "utf8"));
const issues2 = JSON.parse(fs.readFileSync(path.join(__dirname, "issues2.json"), "utf8"));

const allIssues = [...issues1, ...issues2];
console.log(`Ready to create ${allIssues.length} issues...`);

allIssues.forEach((issue, index) => {
  console.log(`[${index + 1}/${allIssues.length}] Creating issue: ${issue.title}`);

  // Create a temporary markdown file for the body to avoid shell escaping issues
  fs.writeFileSync("temp_body.md", issue.body);

  const labelString = issue.labels
    .split(", ")
    .map((l) => `"${l}"`)
    .join(",");

  try {
    execSync(
      `gh issue create --title "${issue.title}" --body-file temp_body.md --label ${labelString}`,
    );
  } catch (err) {
    console.error(`Failed to create issue: ${issue.title}`);
    console.error(err.message);
  }
});

if (fs.existsSync("temp_body.md")) {
  fs.unlinkSync("temp_body.md");
}

console.log("All 50 issues have been processed!");
