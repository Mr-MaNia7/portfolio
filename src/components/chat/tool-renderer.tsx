// src/components/chat/tool-renderer.tsx
import { Contact } from '../contact';
import AvailabilityCard from '../AvailabilityCard';
import { Presentation } from '../presentation';
import AllProjects from '../projects/AllProjects';
import Resume from '../resume';
import Skills from '../skills';
import { Artifact, ArtifactHeader } from '../artifact/artifact';

interface ToolRendererProps {
  toolInvocations: any[];
  messageId: string;
}

/** Maps a tool name to its bespoke artifact. Shared by live and instant turns. */
export function renderToolArtifact(toolName: string) {
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
    default:
      return null;
  }
}

export default function ToolRenderer({ toolInvocations }: ToolRendererProps) {
  return (
    <div className="w-full">
      {toolInvocations.map((tool) => {
        const { toolCallId, toolName } = tool;
        const artifact = renderToolArtifact(toolName);
        if (artifact) return <div key={toolCallId}>{artifact}</div>;

        // Default renderer for other tools: the raw result, set as a document.
        return (
          <Artifact key={toolCallId} label={toolName}>
            <ArtifactHeader kicker="Tool result" title={toolName} />
            <div className="border-t border-border-subtle px-5 py-4 sm:px-7">
              {typeof tool.result === 'object' ? (
                <pre className="scrollbar-subtle overflow-x-auto rounded-md bg-sunken p-3 font-mono text-[13px]">
                  {JSON.stringify(tool.result, null, 2)}
                </pre>
              ) : (
                <p className="text-[15px] text-foreground">
                  {String(tool.result)}
                </p>
              )}
            </div>
          </Artifact>
        );
      })}
    </div>
  );
}
