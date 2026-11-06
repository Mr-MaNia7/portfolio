// src/components/chat/tool-renderer.tsx
import { Contact } from '../contact';
import AvailabilityCard from '../AvailabilityCard';
import { Presentation } from '../presentation';
import AllProjects from '../projects/AllProjects';
import Resume from '../resume';
import Reviews from '../reviews';
import Hobbies from '../hobbies';
import Skills from '../skills';

/** The full detail for a tool, shown in the side panel. Loaded only once a panel opens. */
export function ToolArtifact({ tool }: { tool: string }) {
  return renderToolArtifact(tool);
}

function renderToolArtifact(toolName: string) {
  switch (toolName) {
    case 'getProjects':
      return <AllProjects />;
    case 'getPresentation':
      return <Presentation />;
    case 'getResume':
      return <Resume />;
    case 'getContact':
      return <Contact />;
    case 'getSkills':
      return <Skills />;
    case 'getInternship':
      return <AvailabilityCard />;
    case 'getReviews':
      return <Reviews />;
    case 'getHobbies':
      return <Hobbies />;
    default:
      return null;
  }
}
