import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, MailOpen, Trash2, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  deleteContactMessage,
  listContactMessages,
  setContactMessageRead,
  type ContactMessage,
} from "@/lib/api/contact.server";

const QUERY_KEY = ["admin", "contact-messages"];

/** Admin inbox for messages sent through the portfolio contact form. */
export function MessagesTab() {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => listContactMessages(),
  });

  const update = (fn: (list: ContactMessage[]) => ContactMessage[]) =>
    queryClient.setQueryData<ContactMessage[]>(QUERY_KEY, (old) => fn(old ?? []));

  const toggleRead = async (m: ContactMessage) => {
    update((list) => list.map((x) => (x.id === m.id ? { ...x, is_read: !m.is_read } : x)));
    try {
      await setContactMessageRead({ data: { id: m.id, isRead: !m.is_read } });
    } catch {
      toast.error("Couldn't update the message");
      refetch();
    }
  };

  const remove = async (m: ContactMessage) => {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    update((list) => list.filter((x) => x.id !== m.id));
    try {
      await deleteContactMessage({ data: { id: m.id } });
      toast.success("Message deleted");
    } catch {
      toast.error("Couldn't delete the message");
      refetch();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm">
        Couldn't load messages: {(error as Error).message}. Make sure the
        <code className="mx-1">contact_messages</code> table exists (supabase/setup.sql).
      </div>
    );
  }

  const unread = data?.filter((m) => !m.is_read).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Messages</h2>
          <p className="text-sm text-muted-foreground">
            {data?.length ?? 0} total · {unread} unread
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-md border border-input px-3 py-2 text-sm hover:bg-secondary/10"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {data?.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
          No messages yet. They'll appear here when someone uses the contact form.
        </div>
      ) : (
        <ul className="space-y-3">
          {data?.map((m) => (
            <li
              key={m.id}
              className={`rounded-xl border p-4 ${m.is_read ? "border-border bg-card" : "border-primary/40 bg-primary/5"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    {!m.is_read && (
                      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-primary" />
                    )}
                    {m.name}{" "}
                    <a href={`mailto:${m.email}`} className="text-sm text-primary hover:underline">
                      {m.email}
                    </a>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => toggleRead(m)}
                    title={m.is_read ? "Mark as unread" : "Mark as read"}
                    aria-label={m.is_read ? "Mark as unread" : "Mark as read"}
                    className="rounded-md p-2 text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                  >
                    {m.is_read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => remove(m)}
                    title="Delete"
                    aria-label="Delete message"
                    className="rounded-md p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">
                {m.message || <em className="text-muted-foreground">(no message)</em>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
