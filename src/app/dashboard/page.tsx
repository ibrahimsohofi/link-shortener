'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useUrl } from '@/contexts/UrlContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Copy, Trash2, BarChart2, Link as LinkIcon } from 'lucide-react';
import CopyToClipboard from 'react-copy-to-clipboard';
import Link from 'next/link';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user } = useAuth();
  const { links, getShortLinks, deleteShortLink, pagination } = useUrl();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchLinks = async () => {
      try {
        setIsLoading(true);
        await getShortLinks();
      } catch (error) {
        console.error('Error fetching links:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLinks();
  }, [getShortLinks]);

  const handleCopy = (id: string) => {
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (shortCode: string) => {
    try {
      await deleteShortLink(shortCode);
      toast({
        title: 'Success',
        description: 'Link deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete link',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Manage your shortened links</p>
        </div>

        {!user ? (
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>
                Please login or register to view your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>You need to be logged in to view and manage your links.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Your Links</CardTitle>
              <CardDescription>
                All your shortened links in one place
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="py-8 text-center">Loading your links...</div>
              ) : links.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">You don't have any shortened links yet.</p>
                  <Link href="/" className="mt-4 inline-block">
                    <Button>Create your first link</Button>
                  </Link>
                </div>
              ) : (
                <Table>
                  <TableCaption>
                    Showing {links.length} of {pagination.total} links
                  </TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Original URL</TableHead>
                      <TableHead>Short Link</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {links.map((link) => (
                      <TableRow key={link.id}>
                        <TableCell className="max-w-[200px] truncate" title={link.originalUrl}>
                          {link.originalUrl}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">{link.shortCode}</span>
                            <CopyToClipboard text={link.shortUrl} onCopy={() => handleCopy(link.id)}>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                title="Copy to clipboard"
                              >
                                {copiedId === link.id ? (
                                  <span className="text-green-500 text-xs">Copied!</span>
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </CopyToClipboard>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{link.clicks}</TableCell>
                        <TableCell>
                          {format(new Date(link.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end items-center gap-2">
                            <Link href={`/analytics/${link.shortCode}`}>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View analytics">
                                <BarChart2 className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link href={link.shortUrl} target="_blank" rel="noopener noreferrer">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open link">
                                <LinkIcon className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
                              onClick={() => handleDelete(link.shortCode)}
                              title="Delete link"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            {links.length > 0 && pagination.pages > 1 && (
              <CardFooter className="flex justify-center py-4">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={pagination.page === 1}
                    onClick={() => getShortLinks(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    disabled={pagination.page === pagination.pages}
                    onClick={() => getShortLinks(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
        )}
      </main>
    </div>
  );
}
