<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Notification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class Notifications extends Controller
{
    protected $base_path = "tabs/15-Notifications";
    public function index()
    {
        $auth = Auth::user();
        $notifs = Notification::where('user_id',$auth->id)->get();
        $notification = $notifs->map(function ($not) {
            return [
                'id' => $not->id,
                'message' => $not->message,
                'isRead' => $not->is_read,
                'timestamp' => $not->created_at,
                'referenceId' => $not->user_id
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'notificationsList' => $notification
        ]);
    }

    public function editIsRead($id){
        Notification::findOrFail($id)->update([
            'is_read' => true
        ]);
    }
    public function markAsAllRead(){
        Notification::query()->update([
            'is_read' => true
        ]);
    }
}

