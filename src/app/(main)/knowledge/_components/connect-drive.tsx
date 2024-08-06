'use client';

import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, Link2 } from 'lucide-react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useEffect, useState } from 'react';
import SettingsApi from '@/apis/settings';
import { toast } from 'sonner';
import { ReloadIcon } from '@radix-ui/react-icons';
import { DriveLink } from '@/types';
import Image from 'next/image';

const pattern = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+(\?.*)?$/;

const formSchema = z.object({
  google_drive_url: z.string().regex(pattern, { message: 'Invalid Google Drive folder URL' }),
});

export function ConnectDrive() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      google_drive_url: '',
    },
  });

  const [setting, setSetting] = useState<DriveLink | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      const { data } = await SettingsApi.create({ google_drive_url: values.google_drive_url });
      setSetting(data.setting);
      toast(<span className="font-semibold text-teal-600">Update successful</span>);
    } catch (err: any) {
      toast(<span className="font-semibold text-red-600">Error happen</span>);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await SettingsApi.delete(setting?.id as string);
      setSetting(null);
      form.reset();
      toast(<span className="font-semibold text-teal-600">Delete successful</span>);
    } catch (err: any) {
      toast(<span className="font-semibold text-red-600">Error happen</span>);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadSettings = async () => {
      const { data } = await SettingsApi.list();
      if (data.setting.length > 0) {
        setSetting(data.setting[0]);
        form.setValue('google_drive_url', data.setting[0].google_drive_url);
      }
    };
    loadSettings();
  }, [form]);

  return (
    <div className="w-fit min-w-[390px] place-self-center">
      <div className="h-[390px] border border-dashed bg-gray-50 border-gray-400 flex flex-col justify-center items-center gap-6 p-6 rounded-md">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="w-full flex flex-col justify-center items-center gap-6 "
          >
            <Image
              width="80"
              height="80"
              src="https://img.icons8.com/color/480/google-drive--v1.png"
              alt="google-drive--v1"
            />
            <FormField
              control={form.control}
              name="google_drive_url"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Insert the Google Drive's URL"
                        className="bg-white pr-8"
                        disabled={!!setting}
                        {...field}
                      />
                      <Link className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {setting ? (
              <Button variant="destructive" className="w-full" onClick={handleDelete} type="button">
                {isLoading ? (
                  <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Remove
              </Button>
            ) : (
              <Button type="submit" className="bg-[#4CAF50] hover:bg-[#4CAF50] w-full">
                {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
                Import knowledge
              </Button>
            )}
          </form>
        </Form>
      </div>
    </div>
  );
}
