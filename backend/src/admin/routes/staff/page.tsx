import { defineRouteConfig } from "@medusajs/admin-sdk"
import { useEffect, useState } from "react"
import {
  Container, Heading, Text, Badge, Button, Table,
  Input, Label, Select, Toaster, toast,
} from "@medusajs/ui"
import { Users } from "@medusajs/icons"

type StaffUser = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  metadata: Record<string, any> | null
}

type PendingInvite = {
  id: string
  email: string
  accepted: boolean
  created_at: string
  expires_at: string | null
  pending_role: string | null
  pending_pin: boolean
}

const ROLES = [
  { value: "admin", label: "Admin", description: "Full access to everything" },
  { value: "manager", label: "Manager", description: "Orders, products, customers, reports" },
  { value: "cashier", label: "Cashier", description: "POS sales only, read-only admin" },
]

const RoleBadge = ({ role }: { role: string }) => {
  const color = role === "admin" ? "red" : role === "manager" ? "orange" : "green"
  return <Badge color={color}>{role || "cashier"}</Badge>
}

const StaffPage = () => {
  const [users, setUsers] = useState<StaffUser[]>([])
  const [invites, setInvites] = useState<PendingInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"members" | "invite" | "permissions">("members")

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("cashier")
  const [invitePin, setInvitePin] = useState("")
  const [inviting, setInviting] = useState(false)

  // Edit role
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [editRole, setEditRole] = useState("")
  const [editPin, setEditPin] = useState("")
  const [savingRole, setSavingRole] = useState(false)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, invitesRes] = await Promise.all([
        fetch("/admin/users?limit=100", { credentials: "include" }),
        fetch("/admin/pos/invite", { credentials: "include" }),
      ])

      if (usersRes.ok) {
        const data = await usersRes.json()
        setUsers(data.users || [])
      }
      if (invitesRes.ok) {
        const data = await invitesRes.json()
        setInvites(data.invites || [])
      }
    } catch {
      toast.error("Failed to load staff data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleInvite = async () => {
    if (!inviteEmail) {
      toast.error("Email is required")
      return
    }
    if (invitePin && !/^\d{4,6}$/.test(invitePin)) {
      toast.error("PIN must be 4-6 digits")
      return
    }

    setInviting(true)
    try {
      const res = await fetch("/admin/pos/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          pos_role: inviteRole,
          ...(invitePin ? { pos_pin: invitePin } : {}),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || "Invite sent!")
        setInviteEmail("")
        setInvitePin("")
        setInviteRole("cashier")
        await fetchData()
      } else {
        toast.error(data.message || "Failed to send invite")
      }
    } catch {
      toast.error("Failed to send invite")
    } finally {
      setInviting(false)
    }
  }

  const handleUpdateRole = async (user: StaffUser) => {
    if (editPin && !/^\d{4,6}$/.test(editPin)) {
      toast.error("PIN must be 4-6 digits")
      return
    }

    setSavingRole(true)
    try {
      const newMetadata = {
        ...(user.metadata || {}),
        pos_role: editRole,
        ...(editPin ? { pos_pin: editPin } : {}),
      }
      if (!editPin) delete newMetadata.pos_pin

      const res = await fetch(`/admin/users/${user.id}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: newMetadata }),
      })

      if (res.ok) {
        toast.success(`Updated ${user.first_name || user.email}`)
        setEditingUserId(null)
        await fetchData()
      } else {
        toast.error("Failed to update user")
      }
    } catch {
      toast.error("Failed to update user")
    } finally {
      setSavingRole(false)
    }
  }

  const getName = (u: StaffUser) =>
    [u.first_name, u.last_name].filter(Boolean).join(" ") || u.email

  const tabs = [
    { key: "members" as const, label: "Team Members" },
    { key: "invite" as const, label: "Invite Staff" },
    { key: "permissions" as const, label: "Role Permissions" },
  ]

  const PERMISSIONS = [
    { name: "Full admin access", admin: true, manager: false, cashier: false },
    { name: "Manage team & invites", admin: true, manager: false, cashier: false },
    { name: "Store settings", admin: true, manager: false, cashier: false },
    { name: "API keys & channels", admin: true, manager: false, cashier: false },
    { name: "Create/edit products", admin: true, manager: true, cashier: false },
    { name: "Manage inventory", admin: true, manager: true, cashier: false },
    { name: "Process orders", admin: true, manager: true, cashier: false },
    { name: "Manage customers", admin: true, manager: true, cashier: false },
    { name: "Pricing & promotions", admin: true, manager: true, cashier: false },
    { name: "View reports", admin: true, manager: true, cashier: false },
    { name: "Process refunds (POS)", admin: true, manager: true, cashier: false },
    { name: "Apply large discounts (POS)", admin: true, manager: true, cashier: false },
    { name: "Ring up sales (POS)", admin: true, manager: true, cashier: true },
    { name: "View own transactions (POS)", admin: true, manager: true, cashier: true },
    { name: "View customers (read-only)", admin: true, manager: true, cashier: true },
  ]

  return (
    <div className="flex flex-col gap-4">
      <Toaster />

      {/* Header */}
      <Container className="flex items-center justify-between p-4">
        <div>
          <Heading level="h1">Staff Management</Heading>
          <Text className="text-ui-fg-subtle mt-1">
            Manage team roles, permissions, and POS access
          </Text>
        </div>
        <Button variant="secondary" onClick={fetchData} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </Container>

      {/* Tabs */}
      <Container className="p-0">
        <div className="flex border-b border-ui-border-base">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-ui-fg-base text-ui-fg-base"
                  : "border-transparent text-ui-fg-subtle hover:text-ui-fg-base"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Container>

      {/* Team Members Tab */}
      {activeTab === "members" && (
        <Container className="p-4">
          <div className="flex items-center justify-between mb-4">
            <Heading level="h2">Team Members</Heading>
            <Text size="small" className="text-ui-fg-subtle">
              {users.length} member{users.length !== 1 ? "s" : ""}
            </Text>
          </div>

          {users.length === 0 ? (
            <Text className="text-ui-fg-subtle text-sm py-8 text-center">
              No team members found.
            </Text>
          ) : (
            <Table>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Name</Table.HeaderCell>
                  <Table.HeaderCell>Email</Table.HeaderCell>
                  <Table.HeaderCell>POS Role</Table.HeaderCell>
                  <Table.HeaderCell>PIN</Table.HeaderCell>
                  <Table.HeaderCell>Actions</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {users.map((user) => (
                  <Table.Row key={user.id}>
                    <Table.Cell className="font-medium">
                      {getName(user)}
                    </Table.Cell>
                    <Table.Cell className="text-ui-fg-subtle text-xs">
                      {user.email}
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <select
                          value={editRole}
                          onChange={(e) => setEditRole(e.target.value)}
                          className="border border-ui-border-base rounded-md px-2 py-1 text-sm bg-ui-bg-base"
                        >
                          {ROLES.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                          ))}
                        </select>
                      ) : (
                        <RoleBadge role={user.metadata?.pos_role || "cashier"} />
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <input
                          type="text"
                          value={editPin}
                          onChange={(e) => setEditPin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                          placeholder="4-6 digits"
                          className="border border-ui-border-base rounded-md px-2 py-1 text-sm w-24 bg-ui-bg-base"
                        />
                      ) : (
                        <Text size="small" className="text-ui-fg-subtle">
                          {user.metadata?.pos_pin ? "••••" : "—"}
                        </Text>
                      )}
                    </Table.Cell>
                    <Table.Cell>
                      {editingUserId === user.id ? (
                        <div className="flex gap-2">
                          <Button
                            variant="primary"
                            size="small"
                            onClick={() => handleUpdateRole(user)}
                            disabled={savingRole}
                          >
                            {savingRole ? "Saving..." : "Save"}
                          </Button>
                          <Button
                            variant="secondary"
                            size="small"
                            onClick={() => setEditingUserId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setEditingUserId(user.id)
                            setEditRole(user.metadata?.pos_role || "cashier")
                            setEditPin(user.metadata?.pos_pin || "")
                          }}
                        >
                          Edit Role
                        </Button>
                      )}
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table>
          )}

          {/* Pending Invites */}
          {invites.length > 0 && (
            <div className="mt-6">
              <Heading level="h3" className="mb-3">Pending Invites</Heading>
              <Table>
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>Email</Table.HeaderCell>
                    <Table.HeaderCell>Assigned Role</Table.HeaderCell>
                    <Table.HeaderCell>PIN Set</Table.HeaderCell>
                    <Table.HeaderCell>Status</Table.HeaderCell>
                    <Table.HeaderCell>Sent</Table.HeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {invites.map((inv) => (
                    <Table.Row key={inv.id}>
                      <Table.Cell className="text-xs">{inv.email}</Table.Cell>
                      <Table.Cell>
                        {inv.pending_role ? (
                          <RoleBadge role={inv.pending_role} />
                        ) : (
                          <Text size="small" className="text-ui-fg-subtle">—</Text>
                        )}
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="small" className="text-ui-fg-subtle">
                          {inv.pending_pin ? "Yes" : "No"}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color={inv.accepted ? "green" : "orange"}>
                          {inv.accepted ? "Accepted" : "Pending"}
                        </Badge>
                      </Table.Cell>
                      <Table.Cell className="text-xs text-ui-fg-subtle">
                        {new Date(inv.created_at).toLocaleDateString()}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            </div>
          )}
        </Container>
      )}

      {/* Invite Tab */}
      {activeTab === "invite" && (
        <Container className="p-6 max-w-lg">
          <Heading level="h2" className="mb-1">Invite New Staff Member</Heading>
          <Text className="text-ui-fg-subtle mb-6 text-sm">
            Send an email invite with a pre-assigned POS role. When they accept,
            their role and PIN will be automatically configured.
          </Text>

          <div className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="staff@letscase.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="invite-role">POS Role</Label>
              <select
                id="invite-role"
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full border border-ui-border-base rounded-md px-3 py-2 text-sm bg-ui-bg-base mt-1"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label} — {r.description}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="invite-pin">
                Quick Login PIN <span className="text-ui-fg-subtle">(optional, 4-6 digits)</span>
              </Label>
              <Input
                id="invite-pin"
                type="text"
                placeholder="e.g. 1234"
                value={invitePin}
                onChange={(e) => setInvitePin(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
              />
            </div>

            <div className="bg-ui-bg-subtle rounded-lg p-3 text-sm text-ui-fg-subtle">
              <strong className="text-ui-fg-base">What happens next:</strong>
              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                <li>An email invite is sent to the address above</li>
                <li>They click "Accept Invitation" and set their password</li>
                <li>Their POS role ({inviteRole}) and PIN are automatically assigned</li>
                <li>They can log into both the POS and Medusa admin with role restrictions</li>
              </ol>
            </div>

            <Button
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              className="w-full"
            >
              {inviting ? "Sending Invite..." : "Send Invite"}
            </Button>
          </div>
        </Container>
      )}

      {/* Permissions Tab */}
      {activeTab === "permissions" && (
        <Container className="p-4">
          <Heading level="h2" className="mb-1">Role Permissions Matrix</Heading>
          <Text className="text-ui-fg-subtle mb-4 text-sm">
            Shows what each role can access in both the Medusa Admin and POS.
          </Text>

          <Table>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>Permission</Table.HeaderCell>
                <Table.HeaderCell className="text-center">
                  <Badge color="red">Admin</Badge>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-center">
                  <Badge color="orange">Manager</Badge>
                </Table.HeaderCell>
                <Table.HeaderCell className="text-center">
                  <Badge color="green">Cashier</Badge>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {PERMISSIONS.map((perm, idx) => (
                <Table.Row key={idx}>
                  <Table.Cell className="text-sm">{perm.name}</Table.Cell>
                  <Table.Cell className="text-center">
                    {perm.admin ? "✅" : "❌"}
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {perm.manager ? "✅" : "❌"}
                  </Table.Cell>
                  <Table.Cell className="text-center">
                    {perm.cashier ? "✅" : "❌"}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Container>
      )}
    </div>
  )
}

export const config = defineRouteConfig({
  label: "Staff & Roles",
  icon: Users,
})

export default StaffPage
