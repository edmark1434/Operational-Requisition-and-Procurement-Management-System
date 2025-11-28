<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class Roles extends Controller
{
    protected $base_path = "tabs/09-Roles";
    public function index()
    {
        $success = session('success');
        $message = session('message');
        $roles = Role::all();
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
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role updated successfully!"
    ]);
    }

    public function delete($id){
        RolePermission::where('role_id', $id)->delete();
        Role::where('id', $id)->delete();
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role deleted successfully!"
    ]);
    }

    public function roleAdd(Request $request){
        $validated = $request->validate([
            'NAME' => 'required|string',
            'DESCRIPTION' => 'required|string',
            'IS_ACTIVE' => 'required|boolean'
        ]);
        $newPermission = $request->input('PERMISSIONS');
        $role = Role::create($validated);
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
        return redirect()->route('roles')->with([
            'success'=> true,
            'message' => "Role added successfully!"
    ]);
    }
}
