import { Link } from 'react-router-dom';
import Card from './Card';
import PageHeader from './PageHeader';

export default function PagePlaceholder({ title, purpose, links = [] }) {
  return (
    <section>
      <PageHeader title={title} description={purpose} />
      <Card className="flex flex-wrap gap-4 p-5">
        {links.map((link) => <Link className="app-link text-xs font-medium" key={link.to} to={link.to}>{link.label}</Link>)}
      </Card>
    </section>
  );
}
