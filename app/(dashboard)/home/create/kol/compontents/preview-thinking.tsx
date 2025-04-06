export default function PreviewThinking(props: { texts: string[] }) {
  const { texts } = props;

  return (
    <div className="space-y-4 border-l-2 border-secondary pl-4 text-md">
      {texts.map((text, index) => (
        <p key={index}>{text}</p>
      ))}
    </div>
  );
}
