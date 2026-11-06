import Chat from '@/components/chat/chat';

// A server component, so the landing page is prerendered into the HTML. The chat
// reads ?query= itself after mounting, which keeps the page static.
export default function Home() {
  return <Chat />;
}
