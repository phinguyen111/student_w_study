'use client'

export default function BackendManagement() {
  return (
    <div className="space-y-6 mt-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg border p-6">
        <h2 className="text-2xl font-semibold mb-4">Backend Management</h2>
        <p className="text-muted-foreground">Manage users, languages, levels, and lessons</p>
        <p className="text-sm text-muted-foreground mt-2">
          This section will include:
        </p>
        <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
          <li>User Management</li>
          <li>Language Management</li>
          <li>Level Management</li>
          <li>Lesson Management</li>
        </ul>
      </div>
    </div>
  )
}

