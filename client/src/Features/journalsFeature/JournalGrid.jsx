
import JournalCard from "./JournalCard.jsx";

export default function JournalGrid({ journals = [] }) {
  if (!journals.length)
    return <p className="text-center text-gray-500">No journal entries found.</p>;

  return (
    <section className="grid gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {journals.map((journal) => (
        <JournalCard key={journal.id} journal={journal} />
      ))}
    </section>
  );
}
