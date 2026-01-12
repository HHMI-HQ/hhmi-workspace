This folder contains the source data in CSV format and a script required to generate the compliance wizard configuration information.

The CSV files are downloaded directly from the shared Google Sheet "Preprint Policy Scenarios". The CSV files correspond to the following individual spreadsheets

| Filename                         | Sheet Name               |
|----------------------------------|--------------------------|
| compliance-simplified            | Simplified 2025-07-24    |
| compliance-next-steps            | Next Steps and Help Text |
| compliance-question-descriptions | Question Descriptions    |

All logic and most strings should be changed by updating in the Google Sheet, downloading the CSVs and running `npx tsx src/data/generate-compliance-wizard-config.ts` from the package root folder, in order to update the code. Note some strings are duplicates as constants and/or simplified in the generation script. You may need to examine and make changes there in order to fully affect any modifications to the wizard.