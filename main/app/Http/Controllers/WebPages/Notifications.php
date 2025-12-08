<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request; // Add this

class Notifications extends Controller
{
    protected $base_path = "tabs/15-Notifications";

    public function index()
    {
        $auth = Auth::user();
        $notifs = Notification::where('user_id', $auth->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $notification = $notifs->map(function ($not) {
            return [
                'id' => $not->id,
                'message' => $not->message,
                'isRead' => $not->is_read,
                'timestamp' => $not->created_at,
                'referenceId' => $not->user_id
            ];
        });

        return Inertia::render($this->base_path . '/Main', [
            'notificationsList' => $notification
        ]);
    }

    public function editIsRead(Request $request, $id) // Add Request parameter
    {
        $auth = Auth::user();

        Notification::where('id', $id)
            ->where('user_id', $auth->id)
            ->update([
                'is_read' => true
            ]);

        // FIX: Return a proper Inertia response, not plain JSON
        // Option 1: Redirect back (simplest)
        return redirect()->back();

        // OR Option 2: Return a proper Inertia response
        // return response()->noContent(); // 204 No Content

        // OR Option 3: Return with a flash message
        // return back()->with('success', 'Notification marked as read');
    }

    public function markAsAllRead(Request $request) // Add Request parameter
    {
        $auth = Auth::user();

        Notification::where('user_id', $auth->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true
            ]);

        // FIX: Return a proper Inertia response, not plain JSON
        // Option 1: Redirect back (simplest)
        return redirect()->back();

        // OR Option 2: Return a proper Inertia response
        // return response()->noContent(); // 204 No Content

        // OR Option 3: Return with a flash message
        // return back()->with('success', 'All notifications marked as read');
    }
}
