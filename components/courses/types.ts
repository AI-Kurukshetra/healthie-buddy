export type SectionEnrollmentStatus = "enrolled" | "completed" | "dropped" | null;

export type SectionView = {
  id: string;
  term: string;
  sectionCode: string;
  dayLabel: string;
  timeLabel: string;
  room: string | null;
  instructorName: string | null;
  capacity: number;
  enrolledCount: number;
  seatsRemaining: number;
  enrollmentStatus: SectionEnrollmentStatus;
  showEnrollmentAction: boolean;
};

export type CourseCatalogItem = {
  id: string;
  code: string;
  title: string;
  credits: number;
  sections: SectionView[];
};
