<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Notification;

class NotificationsController extends Controller
{
    public function index()
    {
        // 1. Fetch notifications ONLY for the logged-in user
        $userId = auth()->id();

        $notifications = Notification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($notif) {
                // 2. Map DB columns to Frontend Props
                // Frontend expects: id, message, isRead, timestamp
                return [
                    'id' => $notif->id,
                    'message' => $notif->message,
                    'isRead' => (bool)$notif->is_read, // Convert snake_case to camelCase
                    'timestamp' => $notif->created_at,
                    'type' => $notif->type ?? 'info',
                ];
            });

        // 3. Render the React component provided
        return Inertia::render('Notifications', [
            'notificationsList' => $notifications
        ]);
    }

    public function markAsRead($id)
    {
        // Ensure user can only mark their own notifications
        $notification = Notification::where('user_id', auth()->id())
            ->where('id', $id)
            ->firstOrFail();

        $notification->update(['is_read' => true]);

        return redirect()->back();
    }

    public function markAllAsRead()
    {
        Notification::where('user_id', auth()->id())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return redirect()->back();
    }
}
