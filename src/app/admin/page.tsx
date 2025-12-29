/**
 * Page Admin - Redirection vers /admin/demandes
 */

import { redirect } from 'next/navigation';

export default function AdminPage() {
  redirect('/admin/demandes');
}
