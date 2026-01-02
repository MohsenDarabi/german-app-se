export interface LessonStub {
  id: string;
  title: string;
  description: string;
  path: string; // URL path
}

export interface ModuleStub {
  id: string;
  title: string;
  level: string;
  lessons: LessonStub[];
}

// Only include lessons that have actual content files in content/de-fa/
// Add new lessons here as they are created from content fusion

export const A1_MODULES: ModuleStub[] = [
  {
    id: "module-01",
    title: "بخش ۱: شروع سفر (Basics)",
    level: "A1",
    lessons: [
      {
        id: "A1-M01-L01",
        title: "سلام و خداحافظی (Hallo und Tschüss)",
        description: "یاد بگیرید چطور سلام و خداحافظی کنید و خود را معرفی کنید.",
        path: "/learn/de-fa/A1/A1-M01-L01"
      }
      // Add more lessons here as content JSON files are created
    ]
  }
  // Add more modules here as lessons are created
];

// A2 modules - add when content is created
export const A2_MODULES: ModuleStub[] = [];
