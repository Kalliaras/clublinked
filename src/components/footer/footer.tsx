export default function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800">
      <div className="mx-auto max-w-6xl px-6 py-8 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} ClubLinked. All rights reserved.</p>
      </div>
    </footer>
  );
}
