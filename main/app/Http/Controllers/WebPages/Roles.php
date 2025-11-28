<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use Inertia\Inertia;
use Illuminate\Http\Request;

class Roles extends Controller
{
    protected $base_path = "tabs/09-Roles";
    public function index(Request $request)
    {
        $success = session('success');
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
            'success' => $success ?? false
        ]);
    }
    public function store(){
        return Inertia::render($this->base_path .'/components/RoleAdd');
    }
    public function edit($id){
        $role = Role::findOrFail($id);
        return Inertia::render($this->base_path .'/components/RoleEdit', [
            'roleId' => (int)$id,
            'role' =>[
                'NAME' => $role->name,
                'DESCRIPTION' => $role->description,
                'IS_ACTIVE' => $role->is_active
            ]
        ]);
    }
    public function update(Request $request,$id){
        $validated = $request->validate([
            'NAME' => 'required|string',
            'DESCRIPTION' => 'required|string',
            'IS_ACTIVE' => 'required|boolean'
        ]);

        $user = Role::findOrFail($id);
        $user->update([
            'name' => $validated['NAME'],
            'description' => $validated['DESCRIPTION'],
            'is_active' => $validated['IS_ACTIVE']
        ]);
        return redirect()->route('roles')->with('success', true);
    }
}
