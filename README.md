# SmartClear: Automated Clearance Management System

[![unnlogo.png](https://github.com/hundstechdev/smart-clear/blob/main/public/unnlogo.png)](https://github.com/hundstechdev/smart-clear/blob/main/public/unnlogo.png)

This project helps universities automate their student clearance process, moving away from slow, manual paperwork. It takes student documents, uses AI to verify them instantly, and lets students track their progress in real time. No more long queues or waiting around, just a smooth and efficient way to get cleared for graduation.

## Installation

To get SmartClear up and running on your local machine, follow these steps:

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/hundstechdev/smart-clear.git
    cd smart-clear
    ```

2.  **Install Dependencies**

    ```bash
    npm install
    # or yarn install
    # or pnpm install
    ```

3.  **Set Up Environment Variables**

    Create a `.env` file in the root of your project and add the following environment variables:

    ```env
    DATABASE_URL="postgresql://user:password@localhost:5432/database"
    CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
    CLOUDINARY_API_KEY="your_cloudinary_api_key"
    CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
    GEMINI_API_KEY="your_google_gemini_api_key"
    ```

    *   `DATABASE_URL`: Your PostgreSQL database connection string.
    *   `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials for your Cloudinary account, used for document storage.
    *   `GEMINI_API_KEY`: Your API key for Google Gemini, used for AI document verification.

4.  **Database Setup**

    Apply the Prisma migrations to set up your database schema:

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Development Server**

    ```bash
    npm run dev
    # or yarn dev
    # or pnpm dev
    ```

    Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Usage

SmartClear offers both a student portal for managing clearances and an admin portal for overseeing the process.

### Student Access

Students can log in with their registration number to view their clearance status, upload documents, and download their certificate once all clearances are complete.

1.  Navigate to the homepage ([http://localhost:3000](http://localhost:3000)).
2.  Enter your registration number in the "Student Access" card.
3.  Click "Access Clearance" to log in.
4.  Once logged in, you'll see your dashboard where you can upload documents for each clearance type.

When you upload a document, the system automatically processes it using AI verification.

```mermaid
sequenceDiagram
    actor Student
    participant "Next.js App" as Frontend
    participant "API Server" as API
    participant Cloudinary
    participant "Gemini AI" as AI
    participant PostgreSQL

    Student->>Frontend: Select document to upload
    Frontend->>API: POST /api/student/upload-document {file, clearanceId}
    API->>Cloudinary: Upload file to storage
    Cloudinary-->>API: Returns file URL
    API->>PostgreSQL: Create Document record
    API->>PostgreSQL: Fetch Clearance & Student details
    API->>AI: Send document text for verification
    AI-->>API: Returns verification result (isValid, score, comment)
    API->>PostgreSQL: Update Document record with AI result
    API->>PostgreSQL: Update Clearance status (COMPLETED/REJECTED)
    API->>Frontend: Returns success + verification details
    Frontend->>Student: Display updated clearance status
```

### Admin Access

Administrators can log in to manage student data, monitor overall clearance progress, and enroll new students.

1.  Navigate to the admin login page ([http://localhost:3000/admin/login](http://localhost:3000/admin/login)).
2.  Enter your admin email and password to log in. (Note: Initial admin users need to be manually created in the database or via a seeding script).
3.  On the admin dashboard, you can view statistics, search for students, and enroll new students.

### Certificate Verification

Once a student successfully completes all required clearances, a digital certificate with a unique verification code and QR code is automatically generated.

1.  When all a student's clearances are marked "COMPLETED", the system triggers certificate generation.
2.  The certificate's verification code and QR code URL are stored.
3.  Students can view the QR code on their dashboard.
4.  Anyone can verify a certificate by scanning the QR code or visiting the verification URL with the code.

```mermaid
sequenceDiagram
    actor Student
    participant "Next.js App" as Frontend
    participant "API Server" as API
    participant PostgreSQL
    participant Cloudinary

    Student->>Frontend: Completes final clearance
    Frontend->>API: POST /api/student/upload-document (last document)
    API->>PostgreSQL: Update final Clearance status to COMPLETED
    API->>PostgreSQL: Check all student clearances
    alt All Clearances Completed
        API->>API: Trigger Certificate Generation
        API->>Cloudinary: Generate & Upload QR code image
        Cloudinary-->>API: Returns QR Code URL
        API->>PostgreSQL: Create ClearanceCertificate record (code, QR URL)
        API->>Frontend: Notify Certificate is Ready
        Student->>Frontend: Views Certificate / QR Code
    else Clearances Pending
        API->>Frontend: Notify clearances still pending
    end
```

## Features

*   **Student Portal**: Students can securely log in with their registration number, upload documents, and track their clearance progress.
*   **Admin Dashboard**: Comprehensive overview for administrators, including student management, clearance request statistics, and certificate generation tracking.
*   **AI-Powered Document Verification**: Leverages Google Gemini AI to automatically extract relevant information from uploaded documents and verify their authenticity against student records.
*   **Real-time Progress Tracking**: Students receive instant updates on their document verification and clearance status.
*   **Automated Certificate Generation**: Upon successful completion of all clearances, a digital certificate is automatically generated with a unique verification code and QR code.
*   **Secure Document Handling**: Documents are securely stored using Cloudinary.
*   **QR Code Verification**: Certificates include QR codes for quick and easy verification of authenticity.

## System Architecture / Design

Here's a high-level look at how SmartClear is put together:

```mermaid
flowchart LR
    StudentUI["Student Web Client (Next.js)"]
    AdminUI["Admin Web Client (Next.js)"]
    APIServer["API Server (Next.js API Routes)"]
    Database[("PostgreSQL Database (Prisma)")]
    Cloudinary["Cloudinary (File Storage)"]
    GeminiAI["Google Gemini AI (Verification)"]

    StudentUI --> APIServer
    AdminUI --> APIServer
    APIServer --> Database
    APIServer --> Cloudinary
    APIServer --> GeminiAI

    style StudentUI fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style AdminUI fill:#1e1b4b,stroke:#6366f1,stroke-width:2px,color:#fff
    style APIServer fill:#2e1065,stroke:#8b5cf6,stroke-width:2px,color:#fff
    style Database fill:#0f172a,stroke:#3b82f6,stroke-width:2px,color:#fff
    style Cloudinary fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff
    style GeminiAI fill:#451a03,stroke:#f59e0b,stroke-width:2px,color:#fff
```

## Technologies Used

| Technology             | Description                                          |
| :--------------------- | :--------------------------------------------------- |
| **Next.js**            | React framework for full-stack applications.         |
| **React**              | Frontend library for building user interfaces.       |
| **TypeScript**         | Type-safe JavaScript for robust code.                |
| **Prisma**             | Next-generation ORM for database interaction.        |
| **PostgreSQL**         | Powerful, open-source relational database.           |
| **Cloudinary**         | Cloud-based image and video management.              |
| **Google Gemini AI**   | AI service for advanced document analysis and verification. |
| **Tailwind CSS**       | Utility-first CSS framework for rapid UI development. |
| **Shadcn UI**          | Reusable UI components built with Tailwind CSS and Radix UI. |
| **Sonner**             | Opinionated toast component for React.               |
| **Bcryptjs**           | Library for hashing passwords.                       |
| **QRCode**             | Library for generating QR codes.                     |
| **streamifier**        | Streams buffers into readable streams.               |

## API Documentation

### Admin Endpoints

#### GET /api/admin/dashboard
**Description**: Fetches overall dashboard statistics and a list of all registered students for the admin panel.

**Authentication**: Admin Session required.

**Response**:
```json
{
  "stats": {
    "totalStudents": 100,
    "totalClearanceRequests": 500,
    "completedClearances": 350,
    "pendingClearances": 100,
    "rejectedClearances": 50,
    "certificatesGenerated": 300
  },
  "students": [
    {
      "id": "clt9j1z6t0000abcde12345ef",
      "fullName": "John Doe",
      "regNo": "2022/12345",
      "email": "john.doe@example.com",
      "department": "Computer Science",
      "level": "400",
      "phoneNumber": "08012345678",
      "programme": "B.Sc",
      "stateOfOrigin": "Enugu",
      "clearances": [],
      "certificate": null
    }
  ]
}
```

**Errors**:
*   500: Failed to load dashboard data.

#### POST /api/admin/login
**Description**: Authenticates an administrator and creates an admin session.

**Request**:
```json
{
  "email": "admin@example.com",
  "password": "securepassword"
}
```

**Response**:
```json
{
  "success": true
}
```

**Errors**:
*   400: Email and password are required.
*   401: Invalid credentials.
*   403: Unauthorized (if user role is not OFFICER).
*   500: Something went wrong.

#### POST /api/admin/logout
**Description**: Logs out the currently authenticated administrator.

**Authentication**: Admin Session required.

**Response**:
```json
{
  "success": true
}
```

#### POST /api/admin/students
**Description**: Registers a new student in the system and automatically creates initial clearance records for them.

**Authentication**: Admin Session required.

**Request**:
```json
{
  "fullName": "Jane Smith",
  "regNo": "2023/54321",
  "department": "Electrical Engineering",
  "level": "300",
  "email": "jane.smith@example.com",
  "phoneNumber": "07098765432",
  "stateOfOrigin": "Abia",
  "programme": "B.Eng"
}
```

**Response**:
```json
{
  "id": "clt9j1z6t0000abcde12345ef",
  "fullName": "Jane Smith",
  "regNo": "2023/54321",
  "email": "jane.smith@example.com",
  "department": "Electrical Engineering",
  "level": "300",
  "phoneNumber": "07098765432",
  "programme": "B.Eng",
  "stateOfOrigin": "Abia",
  "createdAt": "2024-07-20T10:00:00.000Z"
}
```

**Errors**:
*   500: Error creating student.

### Authentication Endpoints

#### POST /api/auth/logout
**Description**: Logs out the currently authenticated student by clearing their session cookie.

**Authentication**: Student Session required.

**Response**:
```json
{
  "message": "Logged out"
}
```

#### POST /api/auth/student-login
**Description**: Authenticates a student using their registration number and sets a session cookie.

**Request**:
```json
{
  "regNo": "2022/12345"
}
```

**Response**:
```json
{
  "message": "Login successful",
  "student": {
    "id": "clt9j1z6t0000abcde12345ef",
    "fullName": "John Doe",
    "regNo": "2022/12345",
    "email": "john.doe@example.com",
    "department": "Computer Science",
    "level": "400",
    "phoneNumber": "08012345678",
    "programme": "B.Sc",
    "stateOfOrigin": "Enugu",
    "createdAt": "2024-07-20T10:00:00.000Z"
  }
}
```

**Errors**:
*   400: Reg Number is required.
*   404: Invalid Reg Number.
*   500: Server error.

### Developer Endpoints

#### POST /api/dev/generate-certificate
**Description**: (Development only) Generates a clearance certificate for a hardcoded student (regNo: "2022/287763") for testing purposes.

**Response**:
```json
{
  "id": "clt9j1z6t0000abcde12345ef",
  "studentId": "clt9j1z6t0000abcde12345ef",
  "verificationCode": "ABC123DEF456",
  "qrCodeUrl": "https://res.cloudinary.com/example/image/upload/v12345/smart-clear/qr_code_abc.png",
  "issuedAt": "2024-07-20T10:00:00.000Z"
}
```

**Errors**:
*   404: Student not found.
*   500: Something went wrong.

### Student Endpoints

#### GET /api/student/clearance/[id]
**Description**: Retrieves the latest document uploaded for a specific clearance ID.

**Authentication**: Student Session required.

**Request**: No request body, `id` is a path parameter (e.g., `/api/student/clearance/clxzzabcde123456`).

**Response**:
```json
{
  "id": "doc12345",
  "clearanceId": "clxzzabcde123456",
  "type": "application/pdf",
  "fileUrl": "https://res.cloudinary.com/your_cloud/image/upload/v123456789/smart-clear/document.pdf",
  "detectedType": "STATEMENT_OF_RESULT",
  "extractedText": "...",
  "status": "PENDING",
  "aiVerified": true,
  "aiScore": 95,
  "aiComment": "Document matches student details and required format.",
  "uploadedAt": "2024-07-20T12:00:00.000Z"
}
```

**Errors**:
*   (No explicit error handling in provided code, typically 404 if document not found or 500 for server errors).

#### POST /api/student/upload-document
**Description**: Uploads a student document for a specific clearance, stores it on Cloudinary, and triggers AI verification. Updates clearance status based on AI result.

**Authentication**: Student Session required.

**Request**: `FormData` containing:
*   `file`: The document file (e.g., PDF, JPG, PNG).
*   `clearanceId`: The ID of the clearance this document belongs to.

**Response**:
```json
{
  "success": true,
  "document": {
    "id": "doc12345",
    "clearanceId": "clxzzabcde123456",
    "type": "application/pdf",
    "fileUrl": "https://res.cloudinary.com/your_cloud/image/upload/v123456789/smart-clear/document.pdf",
    "detectedType": "STATEMENT_OF_RESULT",
    "extractedText": "...",
    "status": "PENDING",
    "aiVerified": true,
    "aiScore": 98.5,
    "aiComment": "The statement of result aligns perfectly with the student's registered details.",
    "uploadedAt": "2024-07-20T12:00:00.000Z"
  },
  "verification": {
    "detectedType": "STATEMENT_OF_RESULT",
    "isValid": true,
    "score": 98.5,
    "comment": "The statement of result aligns perfectly with the student's registered details."
  }
}
```

**Errors**:
*   400: Missing file or clearanceId.
*   500: Error during upload, verification, or other server-side issues.

## Contributing

We welcome contributions to SmartClear! If you're interested in improving this project, please consider submitting issues or pull requests. For larger changes, it's a good idea to open an issue first to discuss your proposed changes.

## Author Info

*   **Collins Ifebuche**

[![Readme was generated by Dokugen](https://img.shields.io/badge/Readme%20was%20generated%20by-Dokugen-brightgreen)](https://dokugen-readme.vercel.app)
