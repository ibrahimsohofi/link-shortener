'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useUrl } from '@/contexts/UrlContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Copy, CheckCircle2 } from 'lucide-react';
import CopyToClipboard from 'react-copy-to-clipboard';

type FormValues = {
  url: string;
  customSlug?: string;
};

export default function UrlShortener() {
  const { createShortLink } = useUrl();
  const [shortLink, setShortLink] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      url: '',
      customSlug: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setIsLoading(true);
      setError(null);
      setCopied(false);

      const result = await createShortLink(data.url, data.customSlug || undefined);
      setShortLink(result.shortUrl);
      reset();
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shorten a URL</CardTitle>
        <CardDescription>
          Paste a long URL and get a short link that never expires.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="url">URL to shorten</Label>
            <Input
              id="url"
              placeholder="https://example.com/very/long/url/to/shorten"
              {...register('url', {
                required: 'URL is required',
                pattern: {
                  value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                  message: 'Please enter a valid URL',
                },
              })}
            />
            {errors.url && (
              <p className="text-sm text-destructive">{errors.url.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customSlug">
              Custom slug (optional)
            </Label>
            <Input
              id="customSlug"
              placeholder="my-custom-link"
              {...register('customSlug')}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to generate a random code
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Shortening...' : 'Shorten URL'}
          </Button>
        </form>
      </CardContent>

      {shortLink && (
        <CardFooter className="flex flex-col space-y-2">
          <div className="w-full flex items-center space-x-2 bg-muted p-2 rounded-md">
            <span className="flex-1 font-medium text-sm truncate" title={shortLink}>
              {shortLink}
            </span>
            <CopyToClipboard text={shortLink} onCopy={handleCopy}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Copy to clipboard">
                {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </CopyToClipboard>
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Your shortened link is ready to use!
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
