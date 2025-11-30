<?php

namespace App\Http\Controllers\WebPages;
use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Make;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class MakesAndCategories extends Controller
{
    protected $base_path = "tabs/11-MakesAndCategories";
    public function index()
    {
        $success = session()->pull('success');
        $message = session()->pull('message');
        $make = Make::where('is_active',true)->get();
        $categories = Category::where('is_active',true)->get();
        $makeList = $make->map(function ($mk) {
            return [
                "ID" => $mk->id,
                "NAME" => $mk->name,
                "IS_ACTIVE" => $mk->is_active
            ];
        });
        $categoriesList = $categories->map(function ($categ) {
            return [
                "CAT_ID" => $categ->id,
                "NAME" => $categ->name,
                "DESCRIPTION" => $categ->description,
                "TYPE" => $categ->type,
                "IS_ACTIVE" => $categ->is_active, // 
            ];
        });
        return Inertia::render($this->base_path . '/Main',[
            'makeList' => $makeList,
            'categoriesList' => $categoriesList,
            'success' => $success,
            'message' => $message
        ]);
    }
    public function store_category(){
        return Inertia::render($this->base_path .'/components/CategoryAdd');
    }
    public function create_category(Request $request){
        $user = Auth::user();
        Category::create([
            'name' => $request->input('NAME'),
            'description' => $request->input('DESCRIPTION'),
            'type' => $request->input('TYPE'),
        ]);
        AuditLog::create(attributes: [
                'description' => "Created category ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 25
            ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Category added successfully'
        ]);
    }
    public function edit_category($id){
        $category = Category::findOrFail($id);
        return Inertia::render($this->base_path .'/components/CategoryEdit', [
            'categoryId' => (int)$id,
            'category' => [
                'NAME' => $category->name,
                'DESCRIPTION' => $category->description,
                'TYPE' => $category->type
            ]
        ]);
    }
    public function update_category(Request $request,$id){
        $user = Auth::user();
        Category::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'description' => $request->input('DESCRIPTION'),
            'type' => $request->input('TYPE'),
        ]);
        AuditLog::create(attributes: [
                'description' => "Updated category ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 26
            ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Category updated successfully'
        ]);
    }
    public function store_make(){
        return Inertia::render($this->base_path .'/components/MakeAdd');
    }
    public function create_make(Request $request){
        $user = Auth::user();
        Make::create([
            'name' => $request->input('NAME'),
            'is_active' => $request->input('IS_ACTIVE'),
        ]);
            AuditLog::create(attributes: [
                'description' => "Created make ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 22
            ]);
        
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make added successfully'
        ]);
    }
    public function edit_make($id){
        $make = Make::where('id',$id)->first();
        return Inertia::render($this->base_path .'/components/MakeEdit', [
            'makeId' => (int)$id,
            'make' => [
                'NAME' => $make->name,
                'IS_ACTIVE' => $make->is_active
            ]
        ]);
    }
    public function update_make(Request $request,$id){
        $user = Auth::user();
        Make::findOrFail($id)->update([
            'name' => $request->input('NAME'),
            'is_active' => $request->input('IS_ACTIVE'),
        ]);
        AuditLog::create(attributes: [
                'description' => "Updated make ".$request->input('NAME')." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 23
            ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make updated successfully'
        ]);
    }

    public function delete($id){
        $user = Auth::user();
        Make::findOrFail($id)->update(['is_active' => false]);
        $make= Make::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Deleted make ".$make->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 22
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Make deleted successfully'
        ]);
    }
    public function categDelete($id){
        $user = Auth::user();
        Category::findOrFail($id)->update(['is_active' => false]);
        $categ= Category::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Deleted category ".$categ->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 27
        ]);
        return redirect()->route('makesandcategories')->with([
            'success' => true,
            'message' => 'Category deleted successfully'
        ]);
    }

    public function deleteModel($id){
        $user = Auth::user();
        Make::findOrFail($id)->update(['is_active' => false]);
        $make= Make::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Deleted make ".$make->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 22
        ]);
    }
    public function CategDeleteModel($id){
        $user = Auth::user();
        Category::findOrFail($id)->update(['is_active' => false]);
        $categ= Category::findOrFail($id);
        AuditLog::create(attributes: [
                'description' => "Deleted category ".$categ->name." by ". $user->fullname,
                'user_id' => $user->id,
                'type_id' => 27
        ]);
    }
}

