import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { TabsContent } from "@/components/ui/tabs";

export function SecurityTab() {
  return (
    <TabsContent value="security" className="mt-0 space-y-6 pb-4">
      <div className="space-y-6">
        {/* Password form */}
        <div className="bg-card text-card-foreground">
          <h3 className="mb-4 font-medium">Change Password</h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current_password" className="text-sm font-medium">
                Current Password
              </Label>
              <Input id="current_password" type="password" />
            </div>

            <div className="border-border/30 border-t pt-2">
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="new_password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <Input id="new_password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="confirm_password"
                    className="text-sm font-medium"
                  >
                    Confirm Password
                  </Label>
                  <Input id="confirm_password" type="password" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button className="mt-2">Update Password</Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Login security section */}
        <div className="bg-card text-card-foreground">
          <h3 className="mb-4 font-medium">Login Security</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  Two-Factor Authentication
                </Label>
                <p className="text-muted-foreground text-xs">
                  Add an extra layer of security to your account
                </p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">
                  New Device Login Alerts
                </Label>
                <p className="text-muted-foreground text-xs">
                  Get notified when your account is accessed from a new device
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </div>

        {/* Danger Zone - Styled for emphasis */}
        <div className="border-destructive/20 bg-destructive/5 rounded-lg border p-5">
          <div className="flex items-start gap-3">
            <XCircle className="text-destructive mt-0.5 size-5" />
            <div className="flex-1">
              <h3 className="text-destructive font-medium">Danger Zone</h3>
              <p className="text-muted-foreground mt-1 mb-4 text-sm">
                Once you delete your account, there is no going back. Please be
                certain.
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="bg-destructive/90 hover:bg-destructive"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </TabsContent>
  );
}
