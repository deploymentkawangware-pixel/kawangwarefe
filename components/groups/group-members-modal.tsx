"use client";

import { useQuery } from "@apollo/client/react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GET_GROUP_MEMBERS } from "@/lib/graphql/group-members";

interface GroupMember {
  id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
}

interface GroupMembersData {
  group: {
    id: string;
    name: string;
    members: GroupMember[];
  };
}

interface GroupMembersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  groupName: string;
}

export function GroupMembersModal({ open, onOpenChange, groupId, groupName }: GroupMembersModalProps) {
  const { data, loading, error } = useQuery<GroupMembersData>(GET_GROUP_MEMBERS, {
    variables: { groupId },
    skip: !open,
  });

  const members = data?.group?.members || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Members in {groupName}</DialogTitle>
        </DialogHeader>
        {loading && <div className="text-muted-foreground">Loading members...</div>}
        {error && <div className="text-destructive">Failed to load members.</div>}
        {!loading && !error && (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {members.length === 0 ? (
              <div className="text-muted-foreground">No members in this group.</div>
            ) : (
              <ul className="divide-y">
                {members.map((member: any) => (
                  <li key={member.id} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="font-medium">{member.fullName}</div>
                      <div className="text-xs text-muted-foreground">{member.phoneNumber} {member.email && `| ${member.email}`}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        <div className="flex justify-end pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
