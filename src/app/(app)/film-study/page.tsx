import { ComingSoon } from "../_components/ComingSoon";

export default function FilmStudyPage() {
  return (
    <ComingSoon
      title="Film Study"
      tagline="Watch, tag, and learn from game film — pro and your own."
      bullets={[
        "Clip library with trim, drawing overlays, and tagging",
        "Guided lesson sequence with quiz/checkpoint clips",
        "Upload your own footage and compare against pro reads",
        "Possessions-reviewed streak and concept checklist",
      ]}
    />
  );
}
