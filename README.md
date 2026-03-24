# AyuNetra - Medical Data Management App

A Flutter application for storing and managing medical prescriptions with AI-powered patient briefing capabilities.

## Features

- 🔐 **Dual Authentication**: Separate login for patients and doctors
- 📱 **Prescription Management**: Store and view prescriptions with images
- 🤖 **AI-Powered Analysis**: Automatic prescription reading and patient briefing using Google Gemini AI
- 🎨 **Modern UI**: Beautiful, intuitive interface with Material Design 3
- ☁️ **Supabase Backend**: Secure cloud storage and database

## Setup Instructions

### 1. Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK
- Supabase account
- Google Gemini API key

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the following SQL to create the necessary tables:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('patient', 'doctor')),
  phone TEXT,
  profile_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create prescriptions table
CREATE TABLE prescriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  doctor_id UUID REFERENCES auth.users NOT NULL,
  patient_id UUID REFERENCES auth.users NOT NULL,
  image_url TEXT NOT NULL,
  notes TEXT,
  ai_summary TEXT,
  medications TEXT[],
  dosage TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Prescriptions policies
CREATE POLICY "Patients can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (auth.uid() = patient_id);

CREATE POLICY "Doctors can view own prescriptions"
  ON prescriptions FOR SELECT
  USING (auth.uid() = doctor_id);

CREATE POLICY "Doctors can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (auth.uid() = doctor_id);

CREATE POLICY "Doctors can delete own prescriptions"
  ON prescriptions FOR DELETE
  USING (auth.uid() = doctor_id);

-- Create storage bucket for prescriptions
INSERT INTO storage.buckets (id, name, public) VALUES ('prescriptions', 'prescriptions', true);

-- Storage policies
CREATE POLICY "Anyone can view prescriptions"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'prescriptions');

CREATE POLICY "Authenticated users can upload prescriptions"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'prescriptions' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own prescriptions"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'prescriptions' AND auth.uid()::text = (storage.foldername(name))[1]);
```

3. Get your Supabase URL and anon key from Settings > API

### 3. Google Gemini API Setup

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the API key

### 4. Configure the App

1. Open `lib/utils/constants.dart`
2. Replace the following placeholders:
   - `YOUR_SUPABASE_URL` with your Supabase project URL
   - `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key
   - `YOUR_GEMINI_API_KEY` with your Google Gemini API key

### 5. Install Dependencies

```bash
flutter pub get
```

### 6. Run the App

```bash
flutter run
```

## Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                  # Data models
│   ├── user_model.dart
│   └── prescription_model.dart
├── providers/               # State management
│   ├── auth_provider.dart
│   └── prescription_provider.dart
├── screens/                 # UI screens
│   ├── auth/
│   │   └── login_screen.dart
│   ├── patient/
│   │   ├── patient_dashboard.dart
│   │   ├── add_prescription_screen.dart
│   │   └── prescription_detail_screen.dart
│   ├── doctor/
│   │   └── doctor_dashboard.dart
│   └── splash_screen.dart
├── services/                # Business logic
│   └── ai_service.dart
└── utils/                   # Utilities
    └── constants.dart
```

## Features in Detail

### Authentication
- Separate login/signup for patients and doctors
- Secure authentication using Supabase Auth
- User profile management

### Prescription Management
- Upload prescription images from gallery or camera
- Store prescriptions in Supabase storage
- View all prescriptions in a beautiful card-based UI
- Detailed prescription view with AI analysis

### AI Features
- Automatic prescription text extraction
- Medication identification
- Dosage and instruction extraction
- Patient-friendly briefing generation

## Technologies Used

- **Flutter**: Cross-platform mobile framework
- **Supabase**: Backend as a Service (BaaS)
- **Google Gemini AI**: AI/ML capabilities
- **Provider**: State management
- **Google Fonts**: Typography
- **Image Picker**: Image selection

## License

This project is created for educational purposes.
developer raghavendra singh , Ayush bhradwaj , rishikesh singh


