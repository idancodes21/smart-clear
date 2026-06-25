
export const verificationRules = {
  FEE_CLEARANCE: `
This document should be a University Fee Clearance Certificate.

Verify the following:

- University name is visible.
- Student full name.
- Registration number.
- Department.
- Payment history table.
- Finance/Bursary officer signature.
- Official university stamp or seal.

Extract:

- Student name
- Registration number
- Department
- Payment session
- Officer name (if available)

Return whether each field is present.
`,

  APPLICATION_LETTER: `
This document should be an official Application Letter.

Verify:

- Student name.
- Registration number.
- Department.
- Recipient information.
- Date.
- Student signature.

Extract:

- Student name
- Registration number
- Department
- Recipient
- Date

Return whether each field is present.
`,

  STATEMENT_OF_RESULT: `
This document should be an official Statement of Result.

Verify:

- University name.
- Student name.
- Registration number (if present).
- Department.
- Degree obtained.
- Class of degree.
- Registrar signature.
- Official university stamp.

Extract:

- Student name
- Registration number
- Department
- Degree
- Class of degree
- Graduation year

Return whether each field is present.
`,

  LIBRARY_CLEARANCE: `
This document should be a Library Clearance.

Verify:

- Student name.
- Registration number.
- Library clearance statement.
- Librarian signature.
- Official library stamp.

Extract:

- Student name
- Registration number
- Clearance statement

Return whether each field is present.
`,

  SECURITY_CLEARANCE: `
This document should be a Security Clearance.

Verify:

- Student name.
- Registration number.
- Department.
- Security clearance statement.
- Security officer signature.
- Official security stamp.

Extract:

- Student name
- Registration number
- Department
- Clearance statement

Return whether each field is present.
`,

  ACCOMMODATION_CLEARANCE: `
This document should be an Accommodation Clearance.

Verify:

- University name.
- Student name.
- Registration number.
- Accommodation clearance statement.
- Accommodation officer signature.
- Official accommodation stamp.

Extract:

- Student name
- Registration number
- Hostel name (if available)

Return whether each field is present.
`,

  CONVOCATION_RECEIPT: `
This document should be a Convocation Payment Receipt.

Verify:

- University name.
- Receipt title.
- Student name.
- Registration number.
- QR Code.
- Transaction reference.
- Amount paid.
- Payment status.

Extract:

- Student name
- Registration number
- Amount
- Transaction reference
- Payment date
- Payment status

Return whether each field is present.
`,
} as const;
