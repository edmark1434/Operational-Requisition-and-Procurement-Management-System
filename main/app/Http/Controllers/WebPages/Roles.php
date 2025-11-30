<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class Roles extends Controller
{
    protected $base_path = "tabs/09-Roles";

    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $roles = Role::where('is_active',true)->get();
        $permission = Permission::all();
        $role_permission = RolePermission::all();
        return Inertia::render($this->base_path .'/Main',[
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
            'permission' => $permission->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            }),
            'success' => $success ?? false,
            'message' => $message ?? false
        ]);
    }
    public function store(){
        $permission = Permission::all();
        return Inertia::render($this->base_path .'/components/RoleAdd',[
            'permissions' => $permission->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            })
        ]);
    }
    public function edit($id){
        $role = Role::findOrFail($id);
        $rolePermission = RolePermission::where('role_id', $id)->pluck('perm_id');
        $permissions = Permission::all();
        session(['unique_id' => $rolePermission->toArray()]);
        return Inertia::render($this->base_path .'/components/RoleEdit', [
            'roleId' => (int)$id,
            'role' =>[
                'NAME' => $role->name,
                'DESCRIPTION' => $role->description,
                'IS_ACTIVE' => $role->is_active,
                'PERMISSION_COUNT' => count($rolePermission),
                'PERMISSIONS' => $rolePermission
            ],
            'permissions' => $permissions->map(function ($perm) {
                return [
                    'PERMISSION_ID' => $perm->id,
                    'NAME' => $perm->name,
                    'CATEGORY' => $perm->category,
                ];
            }),
        ]);
    }
    public function update(Request $request,$id){
        $user = Auth::user();
        $ownedPermission = session('unique_id',[]);
        $validated = $request->validate([
            'NAME' => 'required|string',
            'DESCRIPTION' => 'required|string',
            'IS_ACTIVE' => 'required|boolean'
        ]);
        $newPermission = $request->input('PERMISSIONS');

        $removedIds = array_diff($ownedPermission, $newPermission); // [1, 4, 5]
        $addedIds = array_diff($newPermission, $ownedPermission); 

        if(!empty($removedIds)){
        DB::table('role_permission')
                ->where('role_id', $id)
                ->whereIn('perm_id', $removedIds)
                ->delete();
        }

        // Add multiple rows (insert pivot records)
        $insertData = [];
        foreach($addedIds as $permId){
            $insertData[] = [
                'role_id' => $id,
                'perm_id' => $permId,
            ];
        }

        if(!empty($insertData)){
            DB::table('role_permission')->insert($insertData);
        }
        $user = Role::findOrFail($id);
        $user->update([
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'is_active' => $validated['IS_ACTIVE']
        ]);
        AuditLog::create(attributes: [
            'description' => "Role updated ".$validated['NAME'].' by '. $user->fullname,
            'user_id' => $user->id,
            'type_id' => 39
        ]);
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role updated successfully!"
    ]);
    }

    public function delete($id){
        $user = Auth::user();
        RolePermission::where('role_id', $id)->delete();
        Role::where('id', $id)->update(['is_active' => false]);
        $role = Role::where('id', $id)->get();
        AuditLog::create(attributes: [
            'description' => "Role deleted ".$role->name.' by '. $user->fullname,
            'user_id' => $user->id,
            'type_id' => 40
        ]);
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role deleted successfully!"
    ]);
    }

    public function roleAdd(Request $request){
        $user = Auth::user();

        $validated = $request->validate([
            'NAME' => 'required|string',
            'DESCRIPTION' => 'required|string',
            'IS_ACTIVE' => 'required|boolean'
        ]);
        $newPermission = $request->input('PERMISSIONS');
        $role = Role::create([
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'is_active' => $validated['IS_ACTIVE']
        ]);
        $insertData = [];
        foreach($newPermission as $permId){
            $insertData[] = [
                'role_id' => $role->id,
                'perm_id' => $permId,
            ];
        }
        if(!empty($insertData)){
            DB::table('role_permission')->insert($insertData);
        }
        AuditLog::create(attributes: [
                'description' => "Role created ".$validated['NAME'].' by '. $user->fullname,
                'user_id' => $user->id,
                'type_id' => 38
        ]);
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role added successfully!"
    ]);
    }
}
