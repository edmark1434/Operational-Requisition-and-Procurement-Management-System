<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\User;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\UserPermission;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;


class Users extends Controller
{
    protected $base_path = "tabs/08-Users";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $users = User::where('is_active',true)->get();
        $roles = Role::where('is_active',true)->get();
        $permission = Permission::all();
        $role_permission = RolePermission::all();
        return Inertia::render($this->base_path .'/Users',[
            'usersList' => $users->map(function ($user) {
                return [
                    "id" => $user->id,
                    "fullname" => $user->fullname,
                    "username" => $user->username,
                    "created_at" => $user->created_at,
                    "status" => $user->is_active ? 'active' : 'inactive'
                ];
            }),
            'permissions' => $permission->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            }),
            'rolesList' => $roles->map(function ($role) {
                return [
                    'RO_ID' => $role->id,
                    'NAME' => $role->name,
                    'DESCRIPTION' => $role->description,
                ];
            }),
            'role_perm' => $role_permission->map(function ($rp) {
                return [
                    'RP_ID' => $rp->id,
                    'ROLE_ID' => $rp->role_id,
                    'PERM_ID' => $rp->perm_id,
                ];
            }),
            'success' => $success ?? false,
            'message' => $message ?? false
        ]);
    }
    public function store(){
        $roles = Role::where('is_active',true)->get();
        $permission = Permission::all();
        $role_permission = RolePermission::all();
        return Inertia::render($this->base_path .'/UserAdd',[
            'permissions' => $permission->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            }),
            'roles' => $roles->map(function ($role) {
                return [
                    'RO_ID' => $role->id,
                    'NAME' => $role->name,
                    'DESCRIPTION' => $role->description,
                ];
            }),
            'role_perm' => $role_permission->map(function ($rp) {
                return [
                    'RP_ID' => $rp->id,
                    'ROLE_ID' => $rp->role_id,
                    'PERM_ID' => $rp->perm_id,
                ];
            })
        ]);
    }
    public function edit($id){
        $users = User::where('is_active',true)->get();
        $roles = Role::where('is_active',true)->get();
        $permission = Permission::all();
        $username = User::where('id', $id)->get('username');
        $user_permission = UserPermission::where('user_id', $id)->get();
        $unique_id = UserPermission::where('user_id', $id)->pluck('perm_id');
        session(['unique' => $unique_id->toArray()]);
        session(['username' => $username]);
        return Inertia::render($this->base_path .'/UserEdit', [
            'userId' => (int)$id,
            'usersList' => $users->map(function ($user) {
                return [
                    "id" => $user->id,
                    "fullname" => $user->fullname,
                    "username" => $user->username,
                    "created_at" => $user->created_at,
                    "status" => $user->is_active ? 'active' : 'inactive'
                ];
            }),
            'permissions' => $permission->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            }),
            'rolesList' => $roles->map(function ($role) {
                return [
                    'RO_ID' => $role->id,
                    'NAME' => $role->name,
                    'DESCRIPTION' => $role->description,
                ];
            }),
            'user_perm' => $user_permission->map(function ($rp) {
                return [
                    'ID' => $rp->id,
                    'USER_ID' => $rp->user_id,
                    'PERMISSION_ID' => $rp->perm_id,
                ];
            }),
        ]);
    }
    public function editStatus(Request $request,$id){
        $user = User::findOrFail($id);
        $status = $request->input('newStatus');
        $user->update([
            'is_active' => $status == 'active'
        ]); 
        return redirect()->route('users')->with([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
public function createUser(Request $request)
    {
        // Validate the request (optional, but recommended)
        $request->validate([
            'fullname' => 'required|string|max:255',
            'username' => 'required|string|max:50|unique:users,username',
            'password' => 'required|string|min:8',
        ]);

        DB::transaction(function () use ($request) {
            // Create User
            $user = User::create([
                'fullname' => $request->fullname,
                'username' => $request->username,
                'password' => Hash::make($request->password),
                'is_active' => true,
            ]);

            // Attach Permissions
            $userPermissions = [];
            foreach ($request->permissions as $permId) {
                $userPermissions[] = [
                    'user_id' => $user->id, // or $user->US_ID if you use that column name
                    'perm_id' => $permId
                ];
            }
            UserPermission::insert($userPermissions);
        });
        return redirect()->route('users')->with([
            'success' => true,
            'message' => 'User created successfully'
        ]);
    }

    public function updateUser(Request $request,$id){
        $ownedPermission = session('unique', []);
        $username = session()->pull('username', '');
        $rules = [
            'fullname' => 'required|string|max:255',
            'password' => 'string|min:8',
        ];
        if(!($username == $request->input('username'))){
            $rules['username'] = 'required|string|max:50|unique:users,username';
        }
        $validated = $request->validate($rules);
        $newPermission = $request->input('permissions');

        $removedIds = array_diff($ownedPermission, $newPermission); // [1, 4, 5]
        $addedIds = array_diff($newPermission, $ownedPermission); 
        
        if(!empty($removedIds)){
        DB::table('user_permission')
                ->where('user_id', $id)
                ->whereIn('perm_id', $removedIds)
                ->delete();
        }

        $insertData = [];
        foreach($addedIds as $permId){
            $insertData[] = [
                'user_id' => $id,
                'perm_id' => $permId,
            ];
        }

        if(!empty($insertData)){
            DB::table('user_permission')->insert($insertData);
        }
        User::findOrFail($id)->update([
            ...$validated,
            'is_active' => $request->input('status') === 'active'
        ]);
        return redirect()->route('users')->with([
            'success' => true,
            'message' => 'User updated successfully'
        ]);
    }
    public function deleteUser($id){
        UserPermission::where('user_id', $id)->delete();
        User::where('id', $id)->update(['is_active' => false]);
        return redirect()->route('users')->with([
            'success' => true,
            'message' => 'User deleted successfully'
        ]);
    }
}
